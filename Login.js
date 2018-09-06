/**
 * Created by jinm on 2018. 6. 12..
 */
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    WebView,
    AsyncStorage,
    Image,
    TextInput,
    Button,
    TouchableOpacity,
    SafeAreaView,
    Platform
} from 'react-native';

const STORAGE_KEY = 'ASYNC_STORAGE_USER_TOKEN';

export default class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
        }
    }
    componentDidMount() {

    }

    render() {

        let logErr;
        if(this.props.logErr)
            logErr = <Text style={{
                color: '#ee4b55'
            }}>계정정보가 일치하지 않습니다.</Text>;



        return (
            <SafeAreaView style={styles.wrap}>
                <View style={styles.container}>
                    <Image
                        style={styles.wlogo}
                        source={require('./img/wLogo.png')}
                    />

                    {logErr}

                    <TextInput
                        style={styles.inputId}
                        placeholder="아이디(이메일)"
                        keyboardType="email-address"
                        onChangeText={(email) => this.setState({ email })}
                        defaultValue={this.state.email}
                        underlineColorAndroid='rgba(0,0,0,0)'
                    />
                    <TextInput
                        style={styles.inputPw}
                        placeholder="비밀번호"
                        secureTextEntry={true}
                        onChangeText={(password) => this.setState({ password })}
                        defaultValue={this.state.password}
                        underlineColorAndroid='rgba(0,0,0,0)'
                    />
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.loginWrap}
                        onPress={() => this.props.handleLogin(this.state.email, this.state.password)}
                    >
                        <Text
                            style={styles.login}
                        >로그인</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.snsWrap}
                        onPress={() => this.props.handleFacebookLogin()}
                    >
                        <Image
                            style={styles.facebook}
                            source={require('./img/facebook.jpg')}
                        />
                        <Text
                            // style={styles.login}
                        >FACEBOOK 계속하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.snsWrap}
                        onPress={() => this.props.handleInstagramLogin()}
                    >
                        <Image
                            style={styles.instagram}
                            source={require('./img/instagram.jpg')}
                        />
                        <Text
                            // style={styles.login}
                        >INSTAGRAM 계속하기</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.containerBottom}>
                    <TouchableOpacity activeOpacity={0.7}
                                      style={styles.containerBottomLeft}
                                      onPress={() => this.props.handleFindPW()}
                    >
                        <Text style={styles.findPw}>비밀번호 찾기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7}
                                      onPress={() => this.props.handleJoin()}
                                      style={styles.containerBottomRight}
                    >
                        <Text style={styles.joinEmail}>이메일로 회원가입</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        position: 'absolute'
    },
    container: {
        flex: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerBottom: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerBottomLeft: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerBottomRight: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    wlogo: {
        width: 74,
        height: 91,
        marginBottom: 30
    },
    inputId: {
        width: '70%',
        textAlign: 'center',
        fontSize: 15,
        borderBottomColor: '#888888',
        borderBottomWidth: 2,
        padding: 5,
    },
    inputPw: {
        width: '70%',
        textAlign: 'center',
        fontSize: 15,
        borderBottomColor: '#888888',
        borderBottomWidth: 2,
        padding: 10,
    },
    loginWrap: {
        backgroundColor: '#231f20',
        width: '70%',
        height: 45,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 30,
    },
    snsWrap: {
        borderWidth: 2,
        borderColor: '#231f20',
        width: '70%',
        height: 45,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        flexDirection: 'row',
    },
    login: {
        color: '#ffffff',
        fontSize: 15,
    },


    facebook: {
        width: 27,
        height: 27,
        marginRight: 10,
    },
    instagram: {
        width: 27,
        height: 27,
        marginRight: 10,
    },


    findPw: {
        color: '#888888',
        fontSize: 15,
    },
    joinEmail: {
        color: '#f12938',
        fontSize: 15,
    }
});