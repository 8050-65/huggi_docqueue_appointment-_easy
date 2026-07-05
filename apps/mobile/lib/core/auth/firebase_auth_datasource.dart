// lib/core/auth/firebase_auth_datasource.dart
import 'package:firebase_auth/firebase_auth.dart';

abstract class FirebaseAuthDatasource {
  Future<void> verifyPhoneNumber(String phoneNumber);
  Future<String> signInWithCredential(String smsCode);
  Future<String?> getIdToken();
  Future<void> signOut();
}

class FirebaseAuthDatasourceImpl implements FirebaseAuthDatasource {
  final FirebaseAuth _firebaseAuth;

  // Store verification ID during OTP flow
  late String _verificationId;

  FirebaseAuthDatasourceImpl({FirebaseAuth? firebaseAuth})
      : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance;

  @override
  Future<void> verifyPhoneNumber(String phoneNumber) async {
    try {
      await _firebaseAuth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          // Auto sign-in on Android when SMS is auto-retrieved
          await _firebaseAuth.signInWithCredential(credential);
        },
        verificationFailed: (FirebaseAuthException e) {
          throw FirebaseAuthException(
            code: e.code,
            message: 'Phone verification failed: ${e.message}',
          );
        },
        codeSent: (String verificationId, int? resendToken) {
          _verificationId = verificationId;
          // verificationId is stored internally, ready for SMS code verification
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          _verificationId = verificationId;
        },
        timeout: const Duration(minutes: 2),
      );
    } catch (e) {
      throw FirebaseAuthException(
        code: 'phone-verification-error',
        message: 'Failed to verify phone number: $e',
      );
    }
  }

  @override
  Future<String> signInWithCredential(String smsCode) async {
    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: _verificationId,
        smsCode: smsCode,
      );

      final userCredential = await _firebaseAuth.signInWithCredential(credential);
      final idToken = await userCredential.user?.getIdToken();

      if (idToken == null) {
        throw FirebaseAuthException(
          code: 'id-token-null',
          message: 'Failed to get ID token after phone sign-in',
        );
      }

      return idToken;
    } on FirebaseAuthException catch (e) {
      throw FirebaseAuthException(
        code: e.code,
        message: 'SMS code verification failed: ${e.message}',
      );
    } catch (e) {
      throw FirebaseAuthException(
        code: 'sms-verification-error',
        message: 'Failed to verify SMS code: $e',
      );
    }
  }

  @override
  Future<String?> getIdToken() async {
    try {
      return await _firebaseAuth.currentUser?.getIdToken();
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> signOut() async {
    try {
      await _firebaseAuth.signOut();
    } catch (e) {
      throw FirebaseAuthException(
        code: 'sign-out-error',
        message: 'Failed to sign out: $e',
      );
    }
  }
}
