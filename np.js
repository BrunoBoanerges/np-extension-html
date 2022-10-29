const isYTMusic = window.location.href.startsWith('https://music.youtube')
let intervals = []

let currentPlaying = {
  id: '',
  title: '',
};

function getNowPlaying() {
  let titleElements = document.querySelectorAll('h1.title, h1.ytd-watch-metadata, .ytmusic-player-bar .title')

  let text = ''
  titleElements.forEach(element => {
    const tempTx = element.textContent?.trim()
    if (tempTx) text = tempTx
  });

  const id = window.location.search
  let alternativeId = document.querySelector('.ytp-title-link')



  const body = {
    id: new URLSearchParams(id).get('v'),
    title: text
  }

  try {
    if (!hasIdInSearch() && alternativeId) {
      const [u, tempParams] = alternativeId.href.split('/watch')
      body.id = new URLSearchParams(tempParams).get('v')
    }
  } catch (error) {
    console.error(error)
  }

  try {
    if (isYTMusic) {
      let artist = document.querySelector('.ytmusic-player-bar .byline-wrapper .subtitle > * > a')
      if (artist) {
        body.title = artist.text + ' - ' + body.title
      }
    }
  } catch (error) {
    console.error(error)
  }



  if (body.id === currentPlaying.id && body.title === currentPlaying.title) {
    console.log('*** NP - already playing skip post')
    return;
  }

  currentPlaying = body

  makeReqNP(body)
}

async function makeReqNP(body) {
  try {
    console.log(body);
    const endpoint = 'http://localhost:4000/np'

    await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
    })
  } catch (error) {
    console.error(error)
  }
}


function clearAllIntervals() {
  intervals.forEach(i => clearInterval(i))
  intervals = []
}

function hasIdInSearch() {
  return window.location.search.includes('v=')
}

function detectYoutubeMusicChanges() {
  clearAllIntervals()

  intervals.push(setInterval(() => {
    console.log('*** NP - Nav changes undetected, verifying');
    getNowPlaying()
  }, 5000))
}

try {
  window.addEventListener('load', getNowPlaying)

  if (isYTMusic) {
    detectYoutubeMusicChanges()
  }

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    window.removeEventListener('load', getNowPlaying)

    setTimeout(() => {
      getNowPlaying()

      if (isYTMusic && !hasIdInSearch()) {
        detectYoutubeMusicChanges()
      } else if (isYTMusic && hasIdInSearch()) {
        console.log('*** NP - Nav changes detected, cleaning intervals');
        clearAllIntervals()
      }
    }, 2500);

    window.addEventListener('load', getNowPlaying)
  })
} catch (error) {
  console.error(error)
}
