import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerContentComponentProps,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import {useNavigation, CommonActions} from '@react-navigation/native';

type DrawerParamList = {
  Main: undefined;
  Sales: undefined;
  MyPageStack: undefined;
};

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <DrawerContentScrollView {...props}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.appName}>Step Up</Text>
      </View>

      {/* 메인 */}
      <DrawerItem
        label="매출 현황"
        onPress={() => {
          props.navigation.navigate('Main');
        }}
        labelStyle={{
          fontWeight:
            props.state.routeNames[props.state.index] === 'Main'
              ? 'bold'
              : 'normal',
          color:
            props.state.routeNames[props.state.index] === 'Main'
              ? '#2196F3'
              : '#000',
        }}
        style={{
          backgroundColor:
            props.state.routeNames[props.state.index] === 'Main'
              ? '#e3f2fd'
              : 'transparent',
        }}
      />

      {/* 매출 관리 */}
      <DrawerItem
        label="매출 관리"
        onPress={() => {
          props.navigation.navigate('Sales');
        }}
        labelStyle={{
          fontWeight:
            props.state.routeNames[props.state.index] === 'Sales'
              ? 'bold'
              : 'normal',
          color:
            props.state.routeNames[props.state.index] === 'Sales'
              ? '#2196F3'
              : '#000',
        }}
        style={{
          backgroundColor:
            props.state.routeNames[props.state.index] === 'Sales'
              ? '#e3f2fd'
              : 'transparent',
        }}
      />

      <DrawerItem
        label="마이페이지"
        onPress={() => {
          // 스택 초기화 → MyPageScreen으로 이동
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'MyPageStack'}],
            }),
          );
        }}
        labelStyle={{
          fontWeight:
            props.state.routeNames[props.state.index] === 'MyPageStack'
              ? 'bold'
              : 'normal',
          color:
            props.state.routeNames[props.state.index] === 'MyPageStack'
              ? '#2196F3'
              : '#000',
        }}
        style={{
          backgroundColor:
            props.state.routeNames[props.state.index] === 'MyPageStack'
              ? '#e3f2fd'
              : 'transparent',
        }}
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;
