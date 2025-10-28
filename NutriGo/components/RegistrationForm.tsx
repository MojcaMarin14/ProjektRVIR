import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { getAuthInstance, firestore } from '../firebase/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ActivityLevel, Goal, User } from '../models/User';
import { LinearGradient } from 'expo-linear-gradient';
import { userActivityLevelToText, userGoalToText } from '@/models/functions';
import { useRouter } from 'expo-router';

const RegistrationForm: React.FC = () => {
  const [user, setUser] = useState<User>({
    id: '',
    uid: '',
    email: '',
    password: '',
    age: 0,
    height: 0,
    weight: 0,
    activityLevel: '',
    goal: '',
    name: '',
    gender: '',
    calorieIntake: 0,
  });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const router = useRouter();

  const handleInputChange = (field: keyof User, value: string | number) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (user.password.length < 6) {
      setAlertMessage('Password must be at least 6 characters long.');
      setAlertVisible(true);
      return;
    }

    try {
      const auth = getAuthInstance();
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        const userData = { ...user, id: firebaseUser.uid };
        await setDoc(doc(firestore, 'users', firebaseUser.uid), userData);
        router.push({ pathname: '/SuccessScreen', params: { name: user.name } });
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      setAlertMessage('Registration failed. Try again.');
      setAlertVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Create Your Account</Text>
          <TouchableOpacity
  style={styles.backButton}
  onPress={() => router.back()}
>
  <Ionicons name="arrow-back" size={24} color="#000" />
  <Text style={styles.backText}>Back</Text>
</TouchableOpacity>

          {/* INPUTS */}
          <LinearGradient colors={['#92a3fd', '#9dceff']} style={styles.gradientBorder}>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Name"
                value={user.name}
                onChangeText={(v) => handleInputChange('name', v)}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
          </LinearGradient>

          <LinearGradient colors={['#92a3fd', '#9dceff']} style={styles.gradientBorder}>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Email"
                value={user.email}
                onChangeText={(v) => handleInputChange('email', v)}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>
          </LinearGradient>

          <LinearGradient colors={['#92a3fd', '#9dceff']} style={styles.gradientBorder}>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Password"
                value={user.password}
                onChangeText={(v) => handleInputChange('password', v)}
                style={styles.input}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>
          </LinearGradient>

          {/* PICKERS */}
          <View style={styles.pickerBox}>
            <ModalSelector
              data={[
                { key: 'bmr', label: userActivityLevelToText(ActivityLevel.BMR) },
                { key: 'sedentary', label: userActivityLevelToText(ActivityLevel.SEDENTARY) },
                { key: 'light', label: userActivityLevelToText(ActivityLevel.LIGHT) },
                { key: 'moderate', label: userActivityLevelToText(ActivityLevel.MODERATE) },
                { key: 'active', label: userActivityLevelToText(ActivityLevel.ACTIVE) },
                { key: 'very_active', label: userActivityLevelToText(ActivityLevel.VERY_ACTIVE) },
                { key: 'extra_active', label: userActivityLevelToText(ActivityLevel.EXTRA_ACTIVE) },
              ]}
              initValue="Select Activity Level"
              onChange={(option) => handleInputChange('activityLevel', option.key)}
            >
              <Text style={styles.pickerText}>
                {user.activityLevel
                  ? userActivityLevelToText(user.activityLevel as ActivityLevel)
                  : 'Select Activity Level'}
              </Text>
            </ModalSelector>
          </View>

          <View style={styles.pickerBox}>
            <ModalSelector
              data={[
                { key: 'weight_loss', label: userGoalToText(Goal.WEIGHT_LOSS) },
                { key: 'muscle_gain', label: userGoalToText(Goal.MUSCLE_GAIN) },
                { key: 'maintenance', label: userGoalToText(Goal.MAINTENANCE) },
                { key: 'extreme_weight_loss', label: userGoalToText(Goal.EXTREME_WEIGHT_LOSS) },
                { key: 'mild_weight_loss', label: userGoalToText(Goal.MILD_WEIGHT_LOSS) },
              ]}
              initValue="Select Goal"
              onChange={(option) => handleInputChange('goal', option.key)}
            >
              <Text style={styles.pickerText}>
                {user.goal ? userGoalToText(user.goal as Goal) : 'Select Goal'}
              </Text>
            </ModalSelector>
          </View>

          <View style={styles.pickerBox}>
            <ModalSelector
              data={[
                { key: 'male', label: 'Male' },
                { key: 'female', label: 'Female' },
                { key: 'other', label: 'Other' },
              ]}
              initValue="Select Gender"
              onChange={(option) => handleInputChange('gender', option.key)}
            >
              <Text style={styles.pickerText}>
                {user.gender ? user.gender : 'Select Gender'}
              </Text>
            </ModalSelector>
          </View>

          {/* BUTTON */}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <LinearGradient colors={['#92a3fd', '#9dceff']} style={StyleSheet.absoluteFill} />
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ALERT */}
      <Modal transparent visible={alertVisible} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{alertMessage}</Text>
            <TouchableOpacity onPress={() => setAlertVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// 💅 Styles
const styles = StyleSheet.create({
  backButton: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  marginBottom: 10,
},
backText: {
  color: '#000',
  fontSize: 16,
  marginLeft: 6,
},

  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // prostor za navbar
  },
  innerContainer: {
    width: '90%',
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#000' },

  gradientBorder: { width: '100%', padding: 2, borderRadius: 25, marginVertical: 10 },
  inputWrapper: { backgroundColor: '#fff', borderRadius: 25 },
  input: { padding: 12, color: '#000' },

  pickerBox: {
    width: '100%',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  pickerText: { color: '#333', fontSize: 16 },

  button: {
    width: '60%',
    height: 50,
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: { color: '#000', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  closeButton: { backgroundColor: '#ff007f', padding: 10, borderRadius: 25 },
  closeButtonText: { color: '#fff', fontSize: 16 },
});

export default RegistrationForm;
