import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Platform, Alert, PermissionsAndroid, ActivityIndicator, TouchableOpacity} from "react-native";
import MapView, {Marker, Polyline} from "react-native-maps";
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from "react-native-geolocation-service";

//위치 접근 권한 받기
async function requestPermission() {
  try {
    return await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
  }catch(error) {
    console.log(error);
  }
}


function ParentMain({navigation}) {

  const [latitude, setLatitude] = useState(null); //부모의 위치데이터
  const [longitude, setLongitude] = useState(null);

  const [childLat, setChildLat] = useState(null); //자녀의 위치데이터
  const [childLng, setChildLng] = useState(null);
  const [route, setRoute] = useState([]); // 자녀의 이동 경로
  const [show, setShow] = useState(false);

  const [alarm,setAlarm]=useState(null);  //알림 저장을 위한 변수들
  const [where,setWhere]=useState(null);
  const [alarmLat,setAlarmLat]=useState(null);  
  const [alarmLng,setAlarmLng]=useState(null);
  let date = new Date();
  let now = date.toLocaleString();

  const trackPosition = () => {  //부모의 위치추적
    requestPermission();
    try{
      const _watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
        },
        error => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 3000,
          fastestInterval: 2000,
        },
      );
      return () => {
        if(_watchId) {
          Geolocation.clearWatch(_watchId);
        }
      }
    }catch(error){
      console.log(error);
    }
  }

  const showChildLocation = async() => {  //자녀의 위치추적
    try{
      //const value = await AsyncStorage.getItem('userData'); //테스트를 위한 주석처리
      //const parsevalue = JSON.parse(value); //테스트를 위한 주석처리
      fetch('http://34.64.74.7:8081/user/login/parent', {
        method: "POST",
        body: JSON.stringify({
          //userId: parsevalue.childrenInfo[0].userId, //테스트를 위한 주석처리
          "userId": "child",  //테스트를 위한 임시값
          "idx": true,
        }),
        headers : {'Content-Type' : 'application/json; charset=utf-8'}
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);

        if(responseJson.latitude!==null){
        setChildLat(parseFloat(responseJson.latitude));
        setChildLng(parseFloat(responseJson.longitude));
        setRoute(route => [...route, {latitude:parseFloat(responseJson.latitude), longitude: parseFloat(responseJson.longitude)}]);
        setShow(true);
      }
      })
      .catch((error) => {
        console.error(error);
      });
    }catch(error){
      console.log(error);
    }
  }

  const parentAlert=async()=>{
    try{
      //const value = await AsyncStorage.getItem('userData'); //테스트를 위한 주석처리
      //const parsevalue = JSON.parse(value); //테스트를 위한 주석처리
      fetch('http://34.64.74.7:8081/user/login/alarmRec',{
        method:"POST",
        body: JSON.stringify({
         //userId: parsevalue.childrenInfo[0].userId, //테스트를 위한 주석처리
          "userId":"child",
          "idx":true,
        }),
        headers : {'Content-Type' : 'application/json; charset=utf-8'}
      })
      .then((response) => response.json())
      .then(async(responseJson) => {
        console.log(responseJson);

        setAlarm(responseJson.alarm);
        setWhere(responseJson.where);
        setAlarmLat(parseFloat(responseJson.lat));
        setAlarmLng(parseFloat(responseJson.lng));
        
        await AsyncStorage.setItem( //같은 id에 여러 개가 저장될 수 있나?
          'alarm',
          JSON.stringify({
            alarm:responseJson.alarm,
            where:responseJson.where, //핸들링에 따라 필요할수도 불필요할수도 있는 값
            alarmLat:responseJson.lat,  //역지오코딩 필요, 이 값이 아니라 주소값이 들어가는 게 좋을듯
            alarmLng:responseJson.lng   //역지오코딩 필요, 이 값이 아니라 주소값이 들어가는 게 좋을듯
          })
        ) //null 처리
      })
      .catch((error) => {
        console.error(error);
      });
    }catch(error){
      console.log(error);
    }
  }

  /*
  const showInfo = () => {
    Alert.alert(
      '경로 정보',
      '여기에 정보가 보이게?', 
      [
        {text: '확인', onPress: () => {setShow(false)}},
        {text: '취소', onPress: () => {}},
      ]
    )
  }
  */

  useEffect(() => {
    trackPosition();
    setInterval(()=>showChildLocation(),5000); //과연 넘어올것인가
    setInterval(()=>parentAlert(),5000); //과연 넘어올것인가
  }, []);
  
  if(!latitude && !longitude) { //부모 위치정보 없을 때 로딩
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ flex: 1 }}>Loading...</Text>
      </View>
    );
  }

  return (
      <View style={{ flex: 1 }}>
        <View>
          <TouchableOpacity style={styles.alarmButton} onPress={() =>  navigation.navigate('ParentAlertpage')}>
            <Icon name="bell" size={25} color={"#000"}/>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity style={styles.modifyButton} onPress={() =>  navigation.navigate('ParentModifypage')}>
            <Icon name="bars" size={25} color={"#000"}/>
          </TouchableOpacity>
        </View>
        {show === false ? (  //부모 위치 띄우기
        <MapView
          style={{ flex: 1, width:'100%', height:'100%' }}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >

          <Marker
          coordinate={{latitude: latitude, longitude: longitude}}
          >
            <Icon name="map-marker-alt" size={30} color={"#CAEF53"}/>
          </Marker>
          
        </MapView>
        ) : (<></>)}

        {show === true ? (  //자녀 위치 띄우기
        <MapView
        style={{ flex: 1, width:'100%', height:'100%' }}
        initialRegion={{
          latitude: childLat, 
          longitude: childLng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        >
          <Marker
          coordinate={{latitude: childLat, longitude: childLng}}
          >
            <Icon name="map-marker-alt" size={30} color={"#CAEF53"}/>
          </Marker>

          <Polyline
            coordinates={route} strokeColor="#000" strokeColors={['#7F0000']} strokeWidth={5}
           />
          
        </MapView>
        ) : (<></>)}


        <View>
          <TouchableOpacity style={styles.reloadButton} onPress={() => showChildLocation()}>
            <Icon name="redo-alt" size={30} color={"#000"}/>
          </TouchableOpacity>
        </View>
        <View>
          <Button title="설정" onPress={() =>  navigation.navigate('ParentSetUppage')}></Button> 
        </View>
      </View>
  );
}

export default ParentMain;

const styles = StyleSheet.create({
  reloadButton: {
    backgroundColor: "#CAEF53",
    alignItems: "center",
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    position: "absolute",
    bottom: 10,
    right: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: {height: 2, width: 2},
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      }
    })
  },
  alarmButton: {
    alignItems: "center",
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 35,
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modifyButton: {
    alignItems: "center",
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 35,
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  }
})