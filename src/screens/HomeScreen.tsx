import React from 'react';
import {View, Text, Button} from 'react-native';

function HomeScreen({navigation}: any) {
  return (
    <View>
      <Text>홈 화면</Text>
      <Button title="목표 관리" onPress={() => navigation.navigate('SalesTarget')} />
      <Button title="매출 관리" onPress={() => navigation.navigate('SalesRecord')} />
    </View>
  );
}
export default HomeScreen;
