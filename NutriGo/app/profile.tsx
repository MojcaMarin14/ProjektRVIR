import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useUser } from '../context/UserContext';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getAuthInstance, firestore } from '../firebase/firebase';
import { ActivityLevel, Goal, User } from '../models/User';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { userActivityLevelToText, userGoalToText } from '@/models/functions';
import RNPickerSelect from 'react-native-picker-select';

const safeLabel = (text?: string) => text ?? '';

const Profile: React.FC = () => {
  const { user, setUser } = useUser();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const shimmerAnimation = useState(new Animated.Value(0))[0];
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setLocalUser(user);
      if (user.image) loadImageBase64(user.image);
    } else {
      setLocalUser(null);
    }
  }, [user]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnimation]);

  const loadImageBase64 = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      setImageBase64(`data:image/jpeg;base64,${base64}`);
    } catch (error) {
      console.error('Error loading image base64:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access photos is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      const fileName = uri.split('/').pop();
      const docDir = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory;
      if (docDir) {
        const newPath = docDir + fileName;
        await FileSystem.copyAsync({ from: uri, to: newPath });
        if (localUser) {
          const updatedUser = { ...localUser, image: newPath };
          setLocalUser(updatedUser);
          setImageBase64(uri);
          const auth = getAuthInstance();
          if (auth?.currentUser) {
            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { image: newPath }, { merge: true });
            setUser(updatedUser);
          }
        }
      }
    }
  };

  const handleLogout = async () => {
    const auth = getAuthInstance();
    if (auth) await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  const handleInputChange = (field: keyof User, value: string | number) => {
    if (localUser) {
      const updatedUser = { ...localUser, [field]: value };
      setLocalUser(updatedUser);
      const auth = getAuthInstance();
      if (auth?.currentUser) {
        setDoc(doc(firestore, 'users', auth.currentUser.uid), { [field]: value }, { merge: true });
        setUser(updatedUser);
      }
    }
  };

  const defaultImage =
    localUser?.gender === 'female'
      ? require('../assets/images/female-icon.png')
      : require('../assets/images/male-icon.png');

  const goalOptions = Object.values(Goal).map((g) => ({
    label: safeLabel(userGoalToText(g)),
    value: g,
  }));

  const activityOptions = Object.values(ActivityLevel).map((a) => ({
    label: safeLabel(userActivityLevelToText(a)),
    value: a,
  }));

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        {/* BACK BUTTON */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Profile</Text>

        {/* PROFILE IMAGE */}
        <View style={styles.imageContainer}>
          <Image
            source={imageBase64 ? { uri: imageBase64 } : defaultImage}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <MaterialIcons name="edit" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={styles.email}>{localUser?.email}</Text>
        <Text style={styles.label1}>Edit your data:</Text>

        {/* NAME */}
        <Text style={styles.label}>Name</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={localUser?.name || ''}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholderTextColor="#999"
          />
        </View>

        {/* GOAL */}
        <Text style={styles.label}>Goal</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => handleInputChange('goal', value)}
            items={goalOptions}
            placeholder={{ label: 'Select Goal', value: null }}
            value={localUser?.goal || null}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            doneText="Done"
          />
        </View>

        {/* ACTIVITY LEVEL */}
        <Text style={styles.label}>Activity Level</Text>
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => handleInputChange('activityLevel', value)}
            items={activityOptions}
            placeholder={{ label: 'Select Activity Level', value: null }}
            value={localUser?.activityLevel || null}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            doneText="Done"
          />
        </View>

        {/* HEIGHT */}
        <Text style={styles.label}>Height (cm)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            value={localUser?.height?.toString() || ''}
            onChangeText={(value) => handleInputChange('height', value)}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* WEIGHT */}
        <Text style={styles.label}>Weight (kg)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            value={localUser?.weight?.toString() || ''}
            onChangeText={(value) => handleInputChange('weight', value)}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1, backgroundColor: '#fff' },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backText: { color: '#000', fontSize: 16, marginLeft: 6 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  imageContainer: { position: 'relative', marginBottom: 20, alignItems: 'center' },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  iconButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  email: { fontSize: 18, color: '#000', marginBottom: 20 },
  label1: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  label: { width: '100%', marginBottom: 5, fontWeight: 'bold', color: '#000' },
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
    width: '100%',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  input: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 25, color: '#000' },
  logoutButton: {
    width: '60%',
    height: 50,
    marginVertical: 16,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9dceff',
  },
  logoutButtonText: { color: '#fff', fontWeight: 'bold' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    color: '#000',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    color: '#000',
  },
});

export default Profile;
