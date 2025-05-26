import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';

function CustomDrawerContent(props: any) {
    return (
        <DrawerContentScrollView {...props}>

            {/* 헤더 */}
            <View style={styles.header}>
                <Image
                source={require('../../android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png')} // 경로 확인
                style={styles.logo}
                />
                <Text style={styles.appName}>StepUp</Text>
            </View>

            {/* 메뉴 리스트 */}
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;
