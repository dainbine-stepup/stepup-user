import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DeviceInfo from 'react-native-device-info';
function Header() {
  const [installDate, setInstallDate] = useState('');
  useEffect(() => {
    const fetchInstallTime = async () => {
      const installTime = await DeviceInfo.getFirstInstallTime(); // timestamp

      const date = new Date(installTime);
      const formatted = `${date.getFullYear()}.${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
      setInstallDate(formatted);
    };

    fetchInstallTime();
  }, []);

  return (
    <LinearGradient
      colors={['#5ee6dc', '#01b9e9']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Step Up</Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.dateTitleText}>가입일</Text>
        <Text style={styles.dateText}>{installDate}</Text>
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00c6ff',
    borderRadius: 8,
  },
  titleContainer: {
    width: '100%',
    height: '50%',
    borderBottomWidth: 1,
    borderColor: '#ADD8E6',
    justifyContent: 'center',
  },
  title: {
    paddingLeft: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dateContainer: {
    width: '100%',
    height: '50%',
    paddingLeft: 20,
    paddingTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  dateTitleText: {
    color: '#C7F6FD',
  },
  dateText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Header;
