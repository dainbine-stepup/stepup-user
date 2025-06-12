import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import {View, Text} from 'react-native';

// 스크린
import MainScreen from './src/screens/MainScreen';
import SalesScreen from './src/screens/SalesScreen';
import MyPageScreen from './src/screens/MyPageScreen';

// 컴포넌트
import CustomDrawerContent from './src/components/CustomDrawerContent'; // 드로어 컨텐츠

// 데이터베이스
import {initDatabase} from './src/database/initDatabase';

// 네비게이터 생성
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
        initialRouteName="Main"
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={({route}) => {
          const titles: {[key: string]: string} = {
            Main: '매출 현황',
            Sales: '매출 관리',
          };

          return {
            drawerPosition: 'right', // 햄버거 버튼 오른쪽 이동
            headerTitle: () => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 10,
                }}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  {titles[route.name] || route.name}
                </Text>
              </View>
            ),
          };
        }}>
        <Drawer.Screen
          name="Main"
          component={MainScreen}
          options={{title: '매출 현황'}}
        />
        <Drawer.Screen
          name="Sales"
          component={SalesScreen}
          options={{title: '매출 관리'}}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;
