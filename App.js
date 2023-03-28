import { getPermissionsAsync } from "expo-location";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Fontisto } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";

const API_KEY = "b454e37e9b2e2e1403b480ec4cfc31cb";

const icons = {
  Clear: "day-sunny",
  Clouds: "cloudy",
  Atmosphere: "",
  Snow : "snow",
  Rain: "rain",
  Drizzle: "",
  Tunderstorm: "lightning",
};

export default function App() {
  const [city, setCity] = useState("loading...");
  const [days, setDays] = useState([]);
  const [location, setLocation] = useState();
  const [ok, setOk] = useState(true);

  const ask = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();

    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    const { region, district } = location[0];
    setCity(`${region} ${district}`);

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`
    );
    const { list } = await res.json();
    const fil = list
      .map((el) => {
        return {
          dt_txt: el.dt_txt,
          weather: el.weather[0].main,
          temp: el.main.temp,
        };
      })
      .filter((el) => el.dt_txt.includes("00:00:00"));
    setDays(fil);
  };

  useEffect(() => {
    ask();
  });
  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityname}>{city}</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator color={"#333333"} />
          </View>
        ) : (
          days.map((el) => {
            return (
              <View style={styles.day} key={el.dt_txt}>
                <Text style={styles.temp}>{Math.floor(Number(el.temp))}</Text>
                <Fontisto style={styles.icon} name={icons[el.weather]} size={160} color="black" />
                <Text style={styles.desc}>{el.weather}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "tomato",
  },
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityname: {
    fontSize: 60,
    fontWeight: "700",
  },
  weather: {},
  day: {
    width: Dimensions.get("window").width,
    alignItems: "center",
  },
  temp: {
    marginTop: 50,
    fontSize: 180,
  },
  desc: {
    marginTop: -30,
    fontSize: 60,
  },
  icon: {
    marginBottom: 40
  }
});
