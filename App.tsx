import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Image, TouchableOpacity, View, Text} from 'react-native';

// 스크린
import HomeScreen from './src/screens/HomeScreen';
import SalesTargetScreen from './src/screens/SalesTargetScreen';
import SalesRecordScreen from './src/screens/SalesRecordScreen';
import AdviceScreen from './src/screens/AdviceScreen';

// 컴포넌트
import CustomDrawerContent from './src/components/CustomDrawerContent'; // 드로어 컨텐츠

// 데이터베이스
import { initDatabase } from './src/database/initDatabase';

const Drawer = createDrawerNavigator();

// App
function App(): React.JSX.Element {
  useEffect(() => {
    // 앱 시작할 때 테이블 생성
    initDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({route}) => {
          const titles: {[key: string]: string} = {
            Home: 'StepUp',
            SalesTarget: '목표 관리',
            SalesRecord: '매출 관리',
            Advice: '맞춤 상담',
          };

          return {
            drawerPosition: 'right', // 햄버거 버튼 오른쪽 이동
            headerTitle: () => (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={require('./android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png')}
                  style={{width: 40, height: 40, marginRight: 10}}
                />
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  {titles[route.name] || route.name}
                </Text>
              </View>
            ),
          };
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} options={{title: '홈'}} />
        <Drawer.Screen name="SalesTarget" component={SalesTargetScreen} options={{title: '목표 관리'}} />
        <Drawer.Screen name="SalesRecord" component={SalesRecordScreen} options={{title: '매출 관리'}} />
        <Drawer.Screen name="Advice" component={AdviceScreen} options={{title: '맞춤 상담'}} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;
