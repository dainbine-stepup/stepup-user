import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerContentComponentProps,
  DrawerNavigationProp,
} from '@react-navigation/drawer';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {

  return (
    <DrawerContentScrollView {...props}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Image style={styles.img} source={require('../../android/app/src/main/res/mipmap-xhdpi/ic_launcher.png')} />
        <Text style={styles.appName}>Step Up</Text>
      </View>

      <DrawerItemList {...props} />

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
  img: {
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
