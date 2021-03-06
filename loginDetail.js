import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from 'react-native-vector-icons/Ionicons';
import fakeServer from "./fakeServer";
import { useSelector, useDispatch } from "react-redux";
import { setDarkmode } from "./settingAction";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Button } from 'react-native';

const { CalendarModule } = NativeModules;
const lastStateKey = 'LAST_STATE';

const add = async(a, b) => {
     return await CalendarModule.add(a,b);
}

const calEx = async() => {
    return await CalendarModule.calEx();
}
const lastStateStorage = async (lastStateKey, lastStateValue) => {
    try {
        const lastState = JSON.stringify({ lastStateValue: lastStateValue })
        await AsyncStorage.setItem(lastStateKey, lastState)
    } catch (e) {
        console.log(e)
    }
}

//   const getLastState = async (value) => {
//     try {
//       const lastState = await AsyncStorage.getItem(value)
//       return lastState != null ? JSON.parse(lastState) : null;
//     } catch(e) {
//       console.log(e)
//     }
//   }

const Home = () => {
    const [data, setData] = useState();
    // const setting = useSelector(state => state);
    const fetchData = async () => {
        const response = await fakeServer(10, 100);
        setData([...response]);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleOnEndReached = async () => {
        const response = await fakeServer(10, 1);
        setData([...data, ...response]);
    }

    return (
        <View>
            <FlatList
                data={data}
                keyExtractor={item => item.title}
                renderItem={renderItem}
                onEndReached={handleOnEndReached}
                onEndReachedThreshold={0.5}
            />
        </View>
    );
}

const renderItem = ({ item }) => {
    return (<Item title={item.title}
        category={item.category}
        timestamp={item.timestamp}
        thumb={item.thumb} />)
};

const Item = ({ thumb, title, category, timestamp }) => {
    const setting = useSelector(state => state);
    return (
        <View style={styles.item,{ backgroundColor: setting.darkMode ? '#000' : '#fff'} }>
            <Image style={{ borderRadius: 5 }} source={{ uri: thumb, width: 60, height: 60 }} />
            <View style={{ marginLeft: 15 }}>
                <Text style={{ color: setting.darkMode ? '#fff' : '#000' }}>Title:{title}</Text>
                <Text>Category:{category}</Text>
                <Text>Time:{convertTime(timestamp)}</Text>
            </View>
        </View>
    );
}

const Profile = () => {
    const dispatcher = useDispatch();
    const setting = useSelector(state => state);
    
    const handleDarkMode = () => {
        if (setting.darkMode) {
            dispatcher(setDarkmode(false));
        }
        else {
            dispatcher(setDarkmode(true));
        }
        lastStateStorage(lastStateKey, !setting.darkMode);
    }

    return (
        <View>
            <TouchableOpacity
                style={{ flexDirection: 'row', backgroundColor: 'white', width: 100, height: 30, borderRadius: 5 }}
                onPress={handleDarkMode}
            >
                <Text style={{ textAlign: 'center' }}>{setting.darkMode ? 'DarkMode' : 'notDarkMode'}</Text>
            </TouchableOpacity>
            <Text>Profile</Text>
        </View>
    );

}

const Notifications = () => {
    const [sum, setSum] = useState(0);
    const [ex, setEx] = useState(1);
    add(10,20).then(value => {
        console.log(value);
        setSum(value);
    });

    calEx().then(value => {
        setEx(Math.sqrt(value * 6));
    });

    const onPress = () => {
        CalendarModule.createCalendarEvent('testName', 'testLocation');
      };
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Notifications Screen</Text>
            <Button 
                title="Click to invoke your native module!"
                color="#841584"
                onPress={onPress}
            />
            <Text>
                value from native module:
            </Text>
            <Text>{sum}</Text>
            <Text>This is Pi: {ex}</Text>
        </View>
    );
}

const Tabs = createBottomTabNavigator();
const detailScreen = () => {
    return (
        <Tabs.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused
                            ? 'home'
                            : 'home-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    else {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    }
                    // You can return any component that you like here!
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'chocolate',
                tabBarInactiveTintColor: 'gray'
            })} >
            <Tabs.Screen name='Home' component={Home} options={{ headerShown: true }} />
            <Tabs.Screen name='Profile' component={Profile} options={{ headerShown: true }} />
            <Tabs.Screen name='Notifications' component={Notifications} options={{ headerShown: true }} />
        </Tabs.Navigator>
    )
}

const convertTime = (timestamp) => {
    
    var years, months, days, hours, minutes, seconds;
    var currentSeconds = Date.now() / 1000;
    seconds = (currentSeconds - timestamp);
    minutes = Math.floor(seconds / 60);
    hours = Math.floor(minutes / 60);
    days = Math.floor(hours / 24);
    months = Math.floor(days / 30);
    years = Math.floor(months / 12);

    if (years > 0) return years == 1 ? 'a year ago' : years + ' years ago';
    if (months > 0) return months == 1 ? 'a month ago' : months + ' months ago';
    if (days > 0) return days == 1 ? 'a day ago' : days + ' days ago';
    if (hours > 0) return hours == 1 ? hours + 'an hour ago' : hours + ' hours ago';
    if (minutes > 0) return minutes == 1 ? 'a minute ago' : minutes + ' minutes ago';
    if (seconds > 0) return seconds == 1 ? 'a second ago' : seconds + ' seconds ago';

}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        margin: 10
    }

});

export default detailScreen;
