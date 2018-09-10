import React from 'react';
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    WebView,
    AsyncStorage,
    TouchableOpacity,
    BackHandler,
    ToastAndroid,
    Alert,
    ActivityIndicator,
    StatusBar,
    SafeAreaView,
    Linking,
    AppRegistry,
    PushNotificationIOS,
    NetInfo
} from 'react-native';

import firebase from 'react-native-firebase';
import type from 'react-native-firebase';
// import ImagePicker from 'react-native-image-crop-picker';
import SplashScreen from 'react-native-splash-screen'
import Login from "./Login";

import { RemoteMessage, Notification, NotificationOpen } from 'react-native-firebase';

import Toast from 'react-native-easy-toast'


import WebViewAndroid from 'react-native-webview-android';



const STORAGE_KEY = 'ASYNC_STORAGE_USER_TOKEN';
const WEBVIEW_REF = 'WEBVIEW_REF';


export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

        this.load();

        this.exitApp = undefined;

        this.baseUrl = 'https://inshopkorea.com/';
        // this.baseUrl = 'http://iamport.kr/demo';
        // this.baseUrl = 'https://fcmobile.inicis.com/smart/wcard/input_resp//input_kbcard.php';

        this.state = {
            userToken: '',
            url: this.baseUrl + '?' + new Date().getTime(),
            pass: true,
            logErr: false,
            canGoBack: false,
            canGoForward: false,
            visible: true,
            status: true
        };

        this.messageUri = '';

        let topicName = 'wh';

        firebase.messaging().subscribeToTopic(topicName);

        firebase.messaging().hasPermission()
        .then(enabled => {
            if (enabled) {
                // user has permissions
                // console.warn('ok');
            } else {
                // user doesn't have permission
                firebase.messaging().requestPermission()
                .then(() => {
                    // User has authorised
                })
                .catch(error => {
                    // User has rejected permissions
                });
            }
        });

        // this.FB_KEY = '1766452540076948'; // me
        this.FB_KEY = '180608275943395'; // inshop

        // this.IN_KEY = '14fda615e1f5446796778667716074a2'; // me
        this.IN_KEY = '468ff4a0106e409fa61d699b65c77eb1'; // inshop



    }

    hideSpinner() {
        this.setState({ visible: false });
    }

    onToastPress() {
        this.setState({
            url: this.baseUrl + this.messageUri,
            pass: false,
        });
    }

    handleBackButtonClick() {
        if (this.state.canGoBack)
            this.refs[WEBVIEW_REF].goBack();
        else {
            // 2000(2초) 안에 back 버튼을 한번 더 클릭 할 경우 앱 종료
            if (this.exitApp == undefined || !this.exitApp) {
                ToastAndroid.show('한번 더 누르시면 종료됩니다.', ToastAndroid.SHORT);
                this.exitApp = true;

                this.timeout = setTimeout(
                    () => {
                        this.exitApp = false;
                    },
                    2000    // 2초
                );
            } else {
                clearTimeout(this.timeout);

                if(Platform.OS == 'android')
                    BackHandler.exitApp()
            }
            return true;
        }

        return true;
    }

    componentWillMount() {


        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }


    updateToken(fcmToken){
        if (this.state.userToken != '' ) {

            let http = new XMLHttpRequest();
            let url = this.baseUrl + 'sse/user/regToken';
            let params = 'accessToken=' + this.state.userToken + '&fcmToken=' + fcmToken;
            http.open('POST', url, true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            // http.onreadystatechange = function () {//Call a function when the state changes.
            //     console.log(http);
            //     if (http.readyState === 4 && http.status === 200) {
            //         let response = JSON.parse(http.responseText);
            //         console.log(response);
            //         if (response.status === true) {
            //             // console.log(response.data.accesstoken);
            //             console.log(response.data);
            //         }
            //     }
            // }.bind(this);

            http.send(params);
        }
    }
    componentDidMount() {
        NetInfo.isConnected.addEventListener('change', this.handleConnectionChange);

        NetInfo.isConnected.fetch().done(
            (isConnected) => {
                this.setState({ status: isConnected });

                if(!isConnected){
                    //네트워크 연결 로그아웃
                    // this.save('');
                    Alert.alert(
                        '알림',
                        '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
                        [
                            {text: '확인', onPress: () => {
                                this.setState({ status: true });

                                if(Platform.OS == 'android')
                                    BackHandler.exitApp()}
                            },
                        ],
                        { cancelable: false }
                    )
                }
            }
        );


        if(Platform.OS == 'ios')
            PushNotificationIOS.setApplicationIconBadgeNumber(0);

        if(Platform.OS == 'android')
            SplashScreen.hide();



        firebase.messaging().getToken()
        .then(fcmToken => {
            if (fcmToken) {
                // user has a device token
                // console.warn(this.state.userToken,fcmToken);
                    this.updateToken(fcmToken);
            }
        });



        this.messageListener = firebase.messaging().onMessage((message) => {
            // Process your message as required
            // console.warn('1', message._data);

            let notiData = message._data;

            // console.log("notiData", notiData);

            this.updateToken();


            this.messageUri = notiData.uri;
            if (this.refs.toast !== undefined) {
                this.refs.toast.show(notiData.message, 500, () => {
                    this.messageUri = '';
                });
            }
        });

        this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification: Notification) => {

            // Process your notification as required
            // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
            // console.warn('2', notification);
            // this.updateToken();
        });
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            // Process your notification as required
            // console.warn('android foreground', notification);
            // console.log('android foreground', notification._data);
            let notiData = notification._data;

            this.updateToken();
            this.messageUri = notiData.uri;
            if (this.refs.toast !== undefined) {
                this.refs.toast.show(notiData.message, 500, () => {
                    this.messageUri = '';
                });
            }
        });

        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            // Get the action triggered by the notification being opened
            const action = notificationOpen.action;
            // console.log("action", action);
            // Get information about the notification that was opened
            const notification = notificationOpen.notification;
            // console.log("notification", notification);
            // console.warn('push click', notificationOpen);
            // console.log('push click', notificationOpen.notification._data);
            this.updateToken();
            let notiData = notificationOpen.notification._data;

            this.setState({
                // userToken: name,
                url: this.baseUrl + notiData.uri,
                pass: true
            });


            // console.log("notiData", notiData);
            // ToastAndroid.show(notiData.message, ToastAndroid.SHORT);
        });
    }

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('change', this.handleConnectionChange);


        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.messageListener();
        this.notificationDisplayedListener();
        this.notificationListener();
        this.notificationOpenedListener();

    }

    handleConnectionChange = (isConnected) => {
        this.setState({ status: isConnected });


        if(!isConnected){
            //네트워크 연결 로그아웃
            // this.save('');
            Alert.alert(
                '알림',
                '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
                [
                    {text: '확인', onPress: () => {this.setState({ status: true });
                        if(Platform.OS == 'android')
                            BackHandler.exitApp()
                    }},
                ],
                { cancelable: false }
            )
        }
    };

    load = () => {
        AsyncStorage.getItem(STORAGE_KEY).then((name) => {
            // console.warn(name);
            if (name !== null) {
                this.setState({
                    userToken: name,
                    url: this.baseUrl + '?' + new Date().getTime(),
                    pass: true
                });
            }
        });
    };

    save = (name) => {
        AsyncStorage.setItem(STORAGE_KEY, name).then(() => {
            // console.log('svae');
        });
        this.setState({
            userToken: name,
            url: this.baseUrl + '?' + new Date().getTime(),
            pass: true
        });
    };


    handleLogin(id, pw) {
        // console.log(id, pw);

        let http = new XMLHttpRequest();
        let url = this.baseUrl + 'sse/user/loginInApp';
        let params = 'ssEmail=' + id + '&ssPassword=' + pw;
        http.open('POST', url, true);

        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        http.onreadystatechange = function () {//Call a function when the state changes.
            // console.log(http);
            if (http.readyState === 4 && http.status === 200) {
                let response = JSON.parse(http.responseText);
                // console.log(response);
                if (response.status === true) {
                    // console.log(response.data.accesstoken);
                    this.save(response.data.accesstoken);
                } else {
                    this.setState({
                        logErr: true
                    })
                }
            }
        }.bind(this);
        http.send(params);

    }

    handleFacebookLogin() {
        let uri = 'https://www.facebook.com/v2.11/dialog/oauth?client_id=' + this.FB_KEY + '&redirect_uri=' + this.baseUrl + 'sse/user/fbLogin&state=wh';
        // console.log(uri);
        this.setState({
            url: uri,
            pass: false,
        });
    }

    handleInstagramLogin() {
        let uri = 'https://www.instagram.com/oauth/authorize/?client_id=' + this.IN_KEY + '&redirect_uri=' + this.baseUrl + 'sse/user/instaLogin&response_type=code';
        this.setState({
            url: uri,
            pass: false,
        });
    }

    handleFindPW() {
        let uri = 'sse/user/findPassword';
        this.setState({
            url: this.baseUrl + uri,
            pass: false,
        });
    }

    handleJoin() {
        let uri = 'sse/user/joinType';
        this.setState({
            url: this.baseUrl + uri,
            pass: false,
        });
    }


    onNavigationStateChange(navState) {
        // console.log(navState);

        this.setState({
            canGoBack: navState.canGoBack,
            canGoForward: navState.canGoForward
        });


        // console.log(this.refs[WEBVIEW_REF])
        // console.warn(this.state.canGoBack);
    }

    onBack() {
        // console.log('goback');
        this.refs[WEBVIEW_REF].goBack();
    }

    onForward() {
        this.refs[WEBVIEW_REF].goForward();
    }


    webviewCheck(navigator) {
        // return true;
        // console.log(navigator);


        let url = navigator.url;


        let loadKb = false;
        // console.log(url);


        if (url.indexOf('http://') < 0 && url.indexOf('https://') < 0) {
            loadKb = true;

            Linking.canOpenURL(url).then(supported => {
                if (!supported) {
                    // console.log(2);
                    return false;
                } else {
                    // console.log(3)
                    return Linking.openURL(url);
                }
            }).catch(err => {
                return false;
                // console.log('An error occurred', err)
            });
        }
        if (!loadKb)
            return true;

    }

    render() {
        if(Platform.OS == 'ios')
            PushNotificationIOS.setApplicationIconBadgeNumber(0);

        let cookie = this.state.userToken;

        if ((cookie == '' || cookie == null) && this.state.pass)
            return <Login
                logErr={this.state.logErr}
                handleLogin={(id, pw) => this.handleLogin(id, pw)}
                handleFacebookLogin={() => this.handleFacebookLogin()}
                handleInstagramLogin={() => this.handleInstagramLogin()}
                handleFindPW={() => this.handleFindPW()}
                handleJoin={() => this.handleJoin()}
            />;

        //on message 에러 체크
        const patchPostMessageFunction = function () {
            var originalPostMessage = window.postMessage;

            var patchedPostMessage = function (message, targetOrigin, transfer) {
                originalPostMessage(message, targetOrigin, transfer);
            };

            patchedPostMessage.toString = function () {
                return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
            };

            window.postMessage = patchedPostMessage;
        };

        const patchPostMessageJsCode = "(" + String(patchPostMessageFunction) + ")(); $(function(){$('.mobileNoShow').hide()})";



        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle="dark-content"
                />

                <Toast ref="toast"
                       position='top'
                       positionValue={20}
                       fadeInDuration={2000}
                       onPress={() => {
                           // console.warn('sdf');
                       }}
                       onClick={() => {
                           // console.warn('sdf');
                       }}
                />

                {Platform.select({
                    android: () => <WebViewAndroid
                        style={{
                            flex: 12
                        }}
                        ref={WEBVIEW_REF}
                        source={{
                            uri: this.state.url,
                            headers: {
                                'accesstoken': cookie
                            }

                        }}

                        onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                        onShouldStartLoadWithRequest={this.webviewCheck.bind(this)}
                        injectedJavaScript={patchPostMessageJsCode}
                        onMessage={ (event) => {

                            let message = JSON.parse(event.message);

                            // console.log(message);

                            if (message.type === 'pageMove' && message.to === 'home') {

                                this.setState({
                                    url: this.baseUrl + '?' + new Date().getTime(),
                                    pass: true,
                                    logErr: false,
                                    canGoBack: false,
                                });
                            } else if (message.type === 'logout' && message.to === 'home') {
                                this.save('');
                                this.setState({
                                    url: this.baseUrl + '?' + new Date().getTime(),
                                    pass: true,
                                    logErr: false,
                                    canGoBack: false,
                                    userToken: ''
                                });
                            } else if (message.type === 'onLoad') {
                                this.setState({
                                    visible: false
                                });
                            }
                        }}
                    />,
                    ios: () => <WebView

                        scalesPageToFit={false}
                        style={{
                            flex: 12
                        }}
                        ref={WEBVIEW_REF}
                        source={{
                            uri: this.state.url,
                            headers: {
                                'accesstoken': cookie
                            }

                        }}

                        onError={() => {
                            this.setState({
                                url: this.baseUrl + 'welcome/error',
                                pass: true,
                                logErr: false,
                                canGoBack: false,
                            });
                        }}

                        onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                        onShouldStartLoadWithRequest={this.webviewCheck.bind(this)}
                        onLoad={() => {
                            this.hideSpinner();
                        }}
                        injectedJavaScript={patchPostMessageJsCode}
                        onMessage={ (event) => {
                            let message = JSON.parse(event.nativeEvent.data);

                            if (message.type === 'pageMove' && message.to === 'home') {

                                this.setState({
                                    url: this.baseUrl + '?' + new Date().getTime(),
                                    pass: true,
                                    logErr: false,
                                    canGoBack: false,
                                });
                            } else if (message.type === 'logout' && message.to === 'home') {
                                this.save('');
                                this.setState({
                                    url: this.baseUrl + '?' + new Date().getTime(),
                                    pass: true,
                                    logErr: false,
                                    canGoBack: false,
                                    userToken: ''
                                });
                            }
                        }}
                    />
                })()}

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 40,
                }}>
                    <View style={styles.webViewButtonWrap}>
                        <TouchableOpacity
                            disabled={!this.state.canGoBack}
                            onPress={this.onBack.bind(this)}
                        >

                            <Image
                                style={{
                                    width: 13.5,
                                    height: 20
                                }}
                                source={require('./img/icon_goback.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.webViewButtonWrap}>
                        <TouchableOpacity
                            onPress={() => {
                                // console.log('home');
                                this.setState({
                                    url: this.baseUrl + '?' + new Date().getTime(),
                                    pass: true,
                                    logErr: false,
                                    canGoBack: false,
                                });
                            }}
                        >
                            <Image
                                style={{
                                    width: 20,
                                    height: 20
                                }}
                                source={require('./img/icon_home.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.webViewButtonWrap}>
                        <TouchableOpacity
                            disabled={!this.state.canGoForward}
                            onPress={this.onForward.bind(this)}
                        >
                            <Image
                                style={{
                                    width: 13.5,
                                    height: 20
                                }}
                                source={require('./img/icon_goforward.png')}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {this.state.visible && (
                    <View style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <ActivityIndicator
                            color='#bc2b78'
                            size="large"
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 80
                            }}/>
                    </View>
                )}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
    },
    webViewButtonWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
