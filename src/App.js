import logo from './logo.svg';
import './App.css';
import { useState, useRef } from "react";


function pluralize(num) {
  console.log(num)
  if (num === 1) {
    return '';
  } else {
    return 's';
  }
}

function groupBy(objects, property) {
  // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
  // value for property (obj[property])
  if (typeof property !== 'function') {
    const propName = property;
    property = (obj) => obj[propName];
  }

  const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
  for (const object of objects) {
    const groupName = property(object);
    //Make sure that the group exists
    if (!groupedObjects.has(groupName)) {
      groupedObjects.set(groupName, []);
    }
    groupedObjects.get(groupName).push(object);
  }

  // Create an object with the results. Sort the keys so that they are in a sensible "order"
  const result = {};
  for (const key of Array.from(groupedObjects.keys()).sort()) {
    result[key] = groupedObjects.get(key);
  }
  return result;
}

function getDatamuseRhymeUrl(rel_rhy) {
  return `https://api.datamuse.com/words?${(new URLSearchParams({ 'rel_rhy': rel_rhy })).toString()}`;
  // console.log((new URLSearchParams({'rel_rhy': "test"})).toString())
  // return `https://api.datamuse.com/words?${(new URLSearchParams({'rel_rhy': "test"})).toString()}`;
}

/**
* Gets a URL to fetch 'similar to' from Datamuse.
*
* @param {string} ml
*   The word to find similar words for.
*
* @returns {string}
*   The Datamuse request URL.
*/
function getDatamuseSimilarToUrl(ml) {
  return `https://api.datamuse.com/words?${(new URLSearchParams({ 'ml': ml })).toString()}`;
}

function Mylistitem(props) {
  return <li key={Math.random()}>{props.e.word}<button className="btn btn-outline-success" onClick={
    function () {
      props.setSavedWords(function (savedWords) {
        const list = savedWords.slice()
        list.push(props.e.word)
        return list
      })
    }
  }>(save)</button></li>
}

function App() {
  // let x = "test"
  const [wordOutput, setWordOutput] = useState(<></>);
  const [wordDescription, setWordDescription] = useState("");
  const [savedWords, setSavedWords] = useState([]);
  const inputEl = useRef(null);
  const changeOutput = (word, isSyllable) => {
    setWordDescription("Loading");
    if (isSyllable) {
      fetch(getDatamuseRhymeUrl(word))
        .then((response) => response.json())
        .then((data) => {
          setWordDescription("Words that rhyme with " + word)
          console.log(data)
          setWordOutput(displayhelper(data, isSyllable))
        }, (err) => {
          console.error(err);
        });
    }
    else {
      fetch(getDatamuseSimilarToUrl(word))
        .then((response) => response.json())
        .then((data) => {
          setWordDescription("Words with a similar meaning to " + word)
          console.log(data)
          setWordOutput(displayhelper(data, isSyllable))
        }, (err) => {
          console.error(err);
        });
    }
  }
  function displayhelper(data, isSyllable) {
    if (data.length == 0) {
      setWordDescription("(no results)")
    }
    if (isSyllable) {
      const results = [];
      data = groupBy(data, "numSyllables")
      console.log(data);
      for (let prop in data) {
        console.log(data[prop]);
        results.push(<div key={Math.random()}><h2>{prop + " Syllable" + pluralize(Number(prop))}</h2><ul>{data[prop].map(e => {
          { console.log(e) }; return <Mylistitem e={e} setSavedWords={setSavedWords} />
        })}</ul></div>)
      }
      return results
    }
    else {
      const results = []
      for (let item of data) {
        console.log(item);
        results.push(<Mylistitem e={item} setSavedWords={setSavedWords} />)
      }
      return <ul>{results}</ul>
    }
  }

  return (
    <div className="App">
      <h1 className="row">Rhyme Finder (579 Problem Set 6)</h1>
      <div className="row">
        <div className="col">Saved words: <span id="saved_words">{savedWords.join(", ")}</span></div>
      </div>
      <div className="row">
        <div className="input-group col">
          <input className="form-control" type="text" placeholder="Enter a word" id="word_input" ref={inputEl} />
          <button onClick={() => {
            console.log(inputEl.current.value)
            changeOutput(inputEl.current.value, true)
          }} id="show_rhymes" type="button" className="btn btn-primary">Show rhyming words</button>
          <button onClick={() => {
            console.log(inputEl.current.value)
            changeOutput(inputEl.current.value, false)
          }} id="show_synonyms" type="button" className="btn btn-secondary">Show synonyms</button>
        </div>
      </div>
      <div className="row">
        <h2 className="col" id="output_description">{wordDescription}</h2>
      </div>
      <div className="output row">
        <output id="word_output" className="col">
          <ul>
            {wordOutput}
          </ul>
        </output>
      </div>
    </div>

  );
}

export default App;
//somethings