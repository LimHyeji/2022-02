import React, {useState} from "react";
import { View, Text, TextInput, Button, } from "react-native";
import {AsyncStorage} from '@react-native-async-storage/async-storage';

function Login({navigation}){

//const [type, setType] = useState('Login');
//const [action, setAction] = useState('Login');
//const [actionMode, setActionMode] = useState('문구 적기');

const [hasErrors, setHasErrors] = useState(false);
const [form, setForm] = useState({
  userId: {
    value: '',
    type: 'textInput',
    rules: {},
    valid: true,
    },
  password: {
    value: '',
    type: 'textInput',
    rules: {},
    valid: false,
  }
});

updateInput = (name, value) => {
  setHasErrors(false);
  let formCopy = form;
  formCopy[name].value = value;
  setForm(form => {
    return {...formCopy};
  });
};

formHasErrors = () => {
    return hasErrors ? (
      <View style={styles.errorContainer}>
        <Text style={styles.errorLabel}>
          로그인 정보를 다시 확인해주세요.
        </Text>
      </View>
    ) : null;
  };

return (
    <View>
        <Text>로그인</Text>
        <TextInput
            value={form.userId.value}
            type={form.userId.type} // 미입력하면 못 넘어가게
            autoCapitalize={'none'}
            placeholder="아이디"
            placeholderTextColor={'#ddd'}
            onChangeText={value=>updateInput('userId',value)}
            />
        <TextInput
            value={form.password.value}
            type={form.password.type}
            secureTextEntry={true}
            autoCapitalize={'none'}
            placeholder="비밀번호"
            placeholderTextColor={'#ddd'}
            onChangeText={value=>updateInput('password',value)}
            />
          <View>
          <Button title="로그인" onPress={() =>  LoginAPI(form)}></Button>
          </View>
          <View>
          <Button title="회원가입" onPress={() => navigation.navigate('Registerpage')}></Button>
          </View>
          {
            //임의
          }
          <View>
          <Button title="회원정보수정" onPress={() => navigation.navigate('Modifypage')}></Button>
          </View>
          <View>
          <Button title="Test" onPress={() => navigation.navigate('Testpage')}></Button>
          </View>
    </View>
    );
  };

  function LoginAPI(form){
    fetch('http://34.64.74.7:8081/user/login', { //host명 필요
    method: 'POST',
    body: JSON.stringify({
      userId: form.userId.value,
      password:form.password.value
    } ),
    headers : {'Content-Type' : 'application/json; charset=utf-8'}
  })
    .then((response) => 
    /*{
        const cookie=res.headers['map']['set-cookie'];

        AsyncStorage.setItem('token',cookie);
        if(res.status===200||res.status===201){
          res.json()
          .then((data)=>{
            const refreshtoken=data["refreshToken"];
            AsyncStorage.setItem('refreshtoken',refreshtoken);

          })
        }

    }
    */
    
    response.json())
    .then((responseJson) => {
      console.log(responseJson);
      /*
      const cookie=responseJson.headers['map']['set-cookie'];
      AsyncStorage.setItem('token',cookie);

      AsyncStorage.setItem('userId',JSON.stringify({'userId':form.userId.value});
      //userId, username, phoneNum, idx, house, school, startTime 저장 필요
      */
    /*
      idx에 대한 처리?

AsyncStorage.getItem('nickname', (err, result) => {
  const UserInfo = Json.parse(result);

});

    */




           // setLoading(false);
      /*
      if (responseJson.status === 'success') {
        AsyncStorage.setItem('userId', responseJson.data.stu_id);
        console.log(responseJson.data.stu_id);
        navigation.replace('DrawerNavigationRoutes');
      } else {
        setErrortext('아이디와 비밀번호를 다시 확인해주세요');
        console.log('Please check your id or password');
      }*/
    })
    .catch((error) => {
      console.error(error);
    });
  };
  
    export default Login;