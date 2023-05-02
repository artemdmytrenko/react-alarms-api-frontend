import { useState, useEffect } from "react";
import { api_region_names } from "./data/regions";

function lowercaseNestedValues(arr) {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (Array.isArray(item)) {
      lowercaseNestedValues(item);
    } else if (typeof item === "string") {
      arr[i] = item.toLowerCase();
    }
  }
}

const App = () => {
  const [alarmsData, setAlarmsData] = useState([[]]);
  const [topology, setTopology] = useState({});

  useEffect(() => {
    fetch("https://34.201.39.223:8000/api/v1/alarms?location=all", {
      method: "GET",
      headers: {
        Authorization: import.meta.env.VITE_API_TOKEN,
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        data = data["region_forecasts"];
        const res = [];
        Object.keys(data).forEach((key) => {
          res.push(
            new Array(api_region_names[key], Object.values(data?.[key]))
          );
        });
        lowercaseNestedValues(res);
        for (let arr of res) {
          arr[1] =
            arr[1]
              .map((el) => (el === "true" ? 1 : 0))
              .reduce((prev, cur) => prev + cur, 0) / 12;
          arr[1] = parseFloat(arr[1]).toFixed(2);
        }
        setAlarmsData(res);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch("https://code.highcharts.com/mapdata/countries/ua/ua-all.topo.json")
      .then((resp) => resp.json())
      .then((data) => setTopology(data));
  }, []);

  useEffect(() => {
    Highcharts.mapChart("map", {
      chart: {
        map: topology,
        backgroundColor: "#303133",
        height: window.innerHeight - 40,
      },

      title: {
        text: "AIR RAID ALERTS FORECAST",
        style: {
          color: "#EBEEF5",
          fontSize: "1.75rem",
          fontFamily: "'Poppins', sans-serif",
        },
      },

      mapNavigation: {
        enabled: true,
        buttonOptions: {
          verticalAlign: "bottom",
        },
      },

      colorAxis: {
        min: 0,
        max: 1,
        gridLineColor: "#303133",
        marker: { color: "#EFEFFF", width: 1.5 },
        minColor: "#EEEEFF",
        maxColor: "#000022",
        labels: {
          style: { color: "whitesmoke", fontFamily: "'Poppins', sans-serif" },
        },
        stops: [
          [0, "#EFEFFF"],
          [0.67, "#4444FF"],
          [1, "#000022"],
        ],
      },
      credits: {
        enabled: false,
      },

      tooltip: {
        backgroundColor: "#ebeef5",
        padding: 12,
        headerFormat:
          "<b style='font-size: 0.65rem; color: #3B59D9'>{series.name}</b><br>",
        style: {
          color: "#474a52",
          fontSize: "0.85rem",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
        },
      },

      series: [
        {
          data: alarmsData,
          name: "Probability of alarms in the next 12 hours",
          states: {
            hover: {
              color: "#3d5bdf",
              borderColor: "#8b9adf",
            },
          },
          dataLabels: {
            enabled: true,
            format: "{point.name}",
            style: {
              color: "#303133",
              textOutline: "none",
              fontSize: "clamp(0.4em, 0.4em + 0.2vw, 0.6em)",
              fontFamily: "'Poppins', sans-serif",
            },
          },
        },
      ],
    });
  }, [topology, alarmsData]);

  return (
    <>
      <div id="map"></div>
    </>
  );
};

export default App;
