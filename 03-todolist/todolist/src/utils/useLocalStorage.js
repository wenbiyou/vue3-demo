function parse (str) {
  let value
  try {
    value = JSON.parse(str)
  } catch {
    value = null
  }
  return value
}

function stringfy (obj) {
  let value
  try {
    value = JSON.stringify(obj)
  } catch {
    value = null
  }
  return value
}

export default function useLocalStorage () {
  function setItem (key, value) {
    value = stringfy(value)
    window.localStorage.setItem(key, value)
  }

  function getItem(key) {
    let value = window.localStorage.getItem(key)
    if (value) {
      value = parse(value)
    }
    return value
  }

  return {
    setItem,
    getItem
  }
}