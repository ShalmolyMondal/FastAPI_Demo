import "./App.css";
import { useState, useRef, useEffect } from "react";
import Terminal from "react-console-emulator";

function App() {
  const [values, setValues] = useState([]);
  const [firstDropdown, setFirstDropdown] = useState(undefined);
  const [thirdDropdown, setThirdDropdown] = useState(undefined);
  const [orderIndex, setOrderIndex] = useState();
  const [csvData, setCsvData] = useState([]);
  const [total, setTotal] = useState({
    one: null,
    two: null,
    three: null,
  });
  const terminal = useRef(null);

  const commands = {
    wait: {
      description: "Waits one second and sends a message.",
      fn: () => {
        terminal.current.pushToStdout(
          <p style={{ textAlign: "left" }}>{`
          Situation ${
            arr[orderIndex ? orderIndex : 0]
          } traffic is occuring with certainity ${values[0].certainity}
          Speed : ${values[0].Speed} | Density : ${
            values[0].Density
          } | Time Stamp : ${values[0].timestamp.toFixed(0)}`}</p>
        );

        return "Running, please wait...";
      },
    },
  };

  useEffect(() => {
    if (values.length > 0) {
      commands.wait.fn();
      setCsvData((csv) => {
        const shallow = Object.entries(values).map((entry) => {
          if (entry[0] !== "certainity") {
            return { ...entry };
          }
        });

        return [...csv, shallow];
      });
    }
  }, [values]);

  useEffect(() => {
    console.log(csvData);
  }, [csvData]);

  const myWorker = new Worker(new URL("./worker.js", import.meta.url));

  const generateData = function (context) {
    const payLoad = {
      ...cases[context],
      situation: context,
      valueCount: !orderIndex
        ? total.one
        : orderIndex === 1
        ? total.two
        : total.three,
    };
    myWorker.postMessage(payLoad);
  };

  const cases = {
    low: {
      speed: { lower: 40, upper: 80 },
      density: {
        lower: 0,
        upper: 20,
      },
      interval: 1000,
    },
    moderate: {
      speed: { lower: 40, upper: 80 },
      density: {
        lower: 20,
        upper: 40,
      },
      interval: 1000,
    },
    high: {
      speed: { lower: 10, upper: 50 },
      density: {
        lower: 40,
        upper: 60,
      },
      interval: 1000,
    },
  };

  const arr = [
    firstDropdown === "one" || firstDropdown === undefined ? "low" : "high",
    "moderate",
    thirdDropdown === "one" || thirdDropdown === undefined ? "high" : "low",
  ];

  useEffect(() => {
    if (orderIndex) {
      generateData(arr[orderIndex]);
    }
  }, [orderIndex]);

  myWorker.onmessage = function (e) {
    const { data } = e;
    let parsedObject;
    if (data[0] !== "S") {
      parsedObject = JSON.parse(data.replaceAll("'", '"'));
      setValues([parsedObject]);
    } else {
      if (!orderIndex) {
        setOrderIndex(1);
      } else {
        setOrderIndex((oi) => oi + 1);
      }
    }
  };

  const handleSelect = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "first": {
        if (value === "one") {
          setThirdDropdown("three");
          setFirstDropdown("one");
        } else {
          setThirdDropdown("one");
          setFirstDropdown("three");
        }
        break;
      }
      case "third": {
        if (value === "one") {
          setFirstDropdown("three");
          setThirdDropdown("one");
        } else {
          setFirstDropdown("one");
          setThirdDropdown("three");
        }
        break;
      }
      default: {
        throw new Error("Unmatched");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "val_sit1": {
        setTotal((val) => ({ ...val, one: value }));
        break;
      }
      case "val_sit2": {
        setTotal((val) => ({ ...val, two: value }));
        break;
      }
      case "val_sit3": {
        setTotal((val) => ({ ...val, three: value }));
        break;
      }
      default: {
        void 0;
      }
    }
  };
  return (
    <div className="App">
      <div className="selectbox_container">
        {" "}
        <div>
          {" "}
          <label htmlFor="first">Situation One</label>
          <select
            name="first"
            id="first"
            value={firstDropdown}
            onChange={handleSelect}
          >
            <option value="one">Low Traffic</option>
            <option value="two" disabled>
              Moderate Traffic
            </option>
            <option value="three">High Traffic</option>
          </select>
        </div>
        <div>
          <label htmlFor="second">Situation Two</label>
          <select name="second" id="second" onChange={handleSelect}>
            <option value="one" disabled>
              Low Traffic
            </option>
            <option value="two">Moderate Traffic</option>
            <option value="three" disabled>
              High Traffic
            </option>
          </select>
        </div>
        <div>
          {" "}
          <label htmlFor="third">Situation Three</label>
          <select
            name="third"
            id="third"
            value={thirdDropdown}
            onChange={handleSelect}
          >
            <option value="one">Low Traffic</option>
            <option value="two" disabled>
              Moderate Traffic
            </option>
            <option value="three">High Traffic</option>
          </select>
        </div>
      </div>

      
      <div className="selectbox_container" style={{ padding: "1rem" }}>
      <label htmlFor="">
          Sense Frequency
          <input type="text" name="sense_freq" onChange={handleInputChange} />  
        </label>
      </div>

      <div className="selectbox_container" style={{ padding: "1rem" }}>        
        <label htmlFor="">
          Enter number of data records you want to generate
          <input type="text" name="val_sit1" onChange={handleInputChange} />
        </label>
        <label htmlFor="">
        Enter number of data records you want to generate
          <input type="text" name="val_sit2" onChange={handleInputChange} />
        </label>
        <label htmlFor="">
        Enter number of data records you want to generate
          <input type="text" name="val_sit3" onChange={handleInputChange} />
        </label>
      </div>
      <button
        onClick={() => generateData(arr[0])}
        className="btn btn-primary btn-lg button_"
      >
        Generate Data
      </button>

      <Terminal
        commands={commands}
        ref={terminal}
        // promptLabel={"me@React:~$"}
      />
    </div>
  );
}

export default App;
