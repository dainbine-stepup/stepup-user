import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';

// 스크린
import HomeScreen from './src/screens/HomeScreen';
import SalesTargetScreen from './src/screens/SalesTargetScreen';
import SalesRecordScreen from './src/screens/SalesRecordScreen';

const Drawer = createDrawerNavigator();

// App
function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} options={{title: '홈'}} />
        <Drawer.Screen name="SalesTarget" component={SalesTargetScreen} options={{title: '목표 관리'}} />
        <Drawer.Screen name="SalesRecord" component={SalesRecordScreen} options={{title: '매출 관리'}} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;
