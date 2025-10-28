import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CalendarComponent from './calendar';
import { useUser } from '../context/UserContext';
import useWaterIntake from '../hooks/useWaterIntake';
import { calculateCalorieIntake } from '@/models/functions';

interface HistoryEntry {
  date: string;
  amount?: number;
  note?: string;
  weight?: number;
  totalCalories?: number;
}

const Statistics: React.FC = () => {
  const { waterIntakeHistory, loadWaterIntakeHistory } = useWaterIntake();
  const { user, loading } = useUser();
  const [dailyCalories, setDailyCalories] = useState<HistoryEntry[]>([]);
  const [weightData, setWeightData] = useState<HistoryEntry[]>([]);
  const [dailyCalorieIntake, setDailyCalorieIntake] = useState(0);
  const [totalCaloriesConsumed, setTotalCaloriesConsumed] = useState<number>(0);
  const [lastUpdateDate, setLastUpdateDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user) {
      loadWaterIntakeHistory();
      fetchDailyCalories();
      fetchWeightHistory();
      const intake = calculateCalorieIntake(
        user.height,
        user.weight,
        user.age,
        user.gender || 'other',
        user.activityLevel,
        user.goal
      );
      setDailyCalorieIntake(intake || 0);
    }
  }, [user]);

  const fetchDailyCalories = async () => {
    try {
      if (user) {
        const storedCalories = await AsyncStorage.getItem(`dailyCalories_${user.id}`);
        if (storedCalories) {
          const parsedCalories = JSON.parse(storedCalories);
          setDailyCalories(parsedCalories);
          const todayCalories =
            parsedCalories.find(
              (entry: { date: string }) => entry.date === new Date().toISOString().split('T')[0]
            )?.totalCalories || 0;
          setTotalCaloriesConsumed(todayCalories);
        }
      }
    } catch (error) {
      console.error('Error fetching daily calories:', error);
    }
  };

  // 🔹 NALOŽI TEŽO IZ KOLEDARJA
  const fetchWeightHistory = async () => {
    try {
      if (user) {
        const storedWeights = await AsyncStorage.getItem(`markedDates_${user.id}`);
        if (storedWeights) {
          const parsed = JSON.parse(storedWeights);
          const weightEntries = Object.keys(parsed)
            .filter(date => parsed[date].weight && !isNaN(Number(parsed[date].weight)))
            .map(date => ({
              date,
              weight: parseFloat(parsed[date].weight),
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setWeightData(weightEntries);
        }
      }
    } catch (error) {
      console.error('Error loading weight data:', error);
    }
  };

  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (today !== lastUpdateDate) {
      resetCalories();
      setLastUpdateDate(today);
    }

    const millisTillMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).getTime() - now.getTime();
    const timeoutId = setTimeout(() => {
      resetCalories();
      setLastUpdateDate(new Date().toISOString().split('T')[0]);
    }, millisTillMidnight);

    return () => clearTimeout(timeoutId);
  }, [lastUpdateDate]);

  const resetCalories = async () => {
    if (!user) return;
    const newDate = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(
      `dailyCalories_${user.id}`,
      JSON.stringify([{ date: newDate, totalCalories: 0 }])
    );
    setDailyCalories([{ date: newDate, totalCalories: 0 }]);
    setTotalCaloriesConsumed(0);
  };

  // --- Data for charts ---
  const waterDates = waterIntakeHistory.filter(entry => entry.amount !== undefined).map(entry => entry.date);
  const waterAmounts = waterIntakeHistory.filter(entry => entry.amount !== undefined).map(entry => entry.amount!);

  const calorieDates = dailyCalories.map(entry => entry.date);
  const calorieAmounts = dailyCalories.map(entry => entry.totalCalories || 0);

  const weightDates = weightData.map(entry => entry.date);
  const weightValues = weightData.map(entry => entry.weight || 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.notLoggedInContainer}>
        <Text style={styles.notLoggedInText}>Login to see Statistics</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      {/* 💧 Water Intake Chart */}
      <View style={styles.container}>
        <Text style={styles.title}>Water Intake History</Text>
        {waterAmounts.length > 0 ? (
          <LineChart
            data={{
              labels: waterDates,
              datasets: [
                {
                  data: waterAmounts,
                  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                },
              ],
            }}
            width={Dimensions.get('window').width - 40}
            height={260}
            yAxisSuffix="ml"
            chartConfig={chartConfig('#00008B')}
            bezier
            style={styles.chartStyle}
          />
        ) : (
          <Text style={styles.noDataText}>No water data available.</Text>
        )}
      </View>

      {/* 🔥 Daily Calorie Chart */}
      <View style={styles.container}>
        <Text style={styles.title}>Daily Calorie Intake</Text>
        {calorieAmounts.length > 0 ? (
          <LineChart
            data={{
              labels: calorieDates,
              datasets: [
                {
                  data: calorieAmounts,
                  color: (opacity = 1) => `rgba(255, 77, 166, ${opacity})`,
                },
              ],
            }}
            width={Dimensions.get('window').width - 40}
            height={260}
            yAxisSuffix=" kcal"
            chartConfig={chartConfig('#ff4da6')}
            bezier
            style={styles.chartStyle}
          />
        ) : (
          <Text style={styles.noDataText}>No calorie data available.</Text>
        )}
      </View>

      {/* ⚖️ Weight Tracker Chart */}
      <View style={styles.container}>
        <Text style={styles.title}>Weight Tracker</Text>
        {weightValues.length > 0 ? (
          <LineChart
            data={{
              labels: weightDates,
              datasets: [
                {
                  data: weightValues,
                  color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
                },
              ],
            }}
            width={Dimensions.get('window').width - 40}
            height={260}
            yAxisSuffix=" kg"
            chartConfig={chartConfig('#00C853')}
            bezier
            style={styles.chartStyle}
          />
        ) : (
          <Text style={styles.noDataText}>No weight data available.</Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <CalendarComponent />
      </View>
    </ScrollView>
  );
};

// --- Chart Config Helper ---
const chartConfig = (color: string) => ({
  backgroundColor: '#f5f5f5',
  backgroundGradientFrom: '#f5f5f5',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 1,
  color: (opacity = 1) => `${color}${Math.floor(opacity * 255).toString(16)}`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: color,
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
  },
});

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    alignItems: 'center',
  },
  container: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 20,
    width: Dimensions.get('window').width - 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
    fontFamily: 'SpaceMono-Regular',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 10,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  notLoggedInText: {
    fontSize: 18,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default Statistics;
