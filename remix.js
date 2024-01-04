const g = document.getElementById.bind(document)

const imageNames = [
  '200/headshot/aragon-1_bqzjbr',
  '200/headshot/aragon-2_twe4bg',
  '199/headshot/aragon-3_pfqrbg',
  '200/headshot/aragon-4_djgmuv',
  '200/headshot/aragon-5_awb61u',
  '200/headshot/aragon-6_tmnuhz',
  '199/headshot/aragon-7_ihsncj',
  '199/headshot/aragon-8_axjlcg',
  '199/headshot/aragon-9_t49cir',
  '199/headshot/aragon-10_xre1ho',
  '198/headshot/aragon-11_ztgsmx',
  '198/headshot/aragon-12_q65tuu',
  '199/headshot/aragon-13_ou5uo4',
  '198/headshot/aragon-14_f3l52h',
  '197/headshot/aragon-15_ghoqwr',
  '197/headshot/aragon-16_ul0t7i',
  '199/headshot/aragon-17_pvpha7',
  '197/headshot/aragon-18_glwl4j',
  '198/headshot/aragon-19_qsjvif',
  '197/headshot/aragon-20_vmnxvs',
]
let shuffledImages = []

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

let history = [
  {
    role: 'system',
    content: `Generate content for my personal website mattborn.com.`,
  },
]

const turbo = async messages => {
  // console.log('Fetching data…', messages)
  const response = await fetch(`https://us-central1-samantha-374622.cloudfunctions.net/turbo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  })
  return response.text()
}

const toJSON = str => {
  const curly = str.indexOf('{')
  const square = str.indexOf('[')
  let first
  if (curly < 0) first = '[' // only for empty arrays
  else if (square < 0) first = '{'
  else first = curly < square ? '{' : '['
  const last = first === '{' ? '}' : ']'
  // ensure JSON is complete
  let count = 0
  for (const c of str) {
    if (c === '{' || c === '[') count++
    else if (c === '}' || c === ']') count--
  }
  if (!count) return JSON.parse(str.slice(str.indexOf(first), str.lastIndexOf(last) + 1))
}

const remix = () => {
  g('remix').innerHTML = '<i class="fa-regular fa-ellipsis"></i>Loading…'
  try {
    history.push({
      role: 'user',
      content: `Return a single JSON object copying this schema: ${JSON.stringify({
        headline: 'Full Stack Designer',
        lede: '👋🏼 Hey! I’m a product designer, coder, and AI architect based in Salt Lake.',
        style: 'Matt',
      })} and rewrite the values to introduce me in the style of a famous voice such as Drax the Destroyer, Kendrick Lamar, Samuel L. Jackson, Sigmund Freud, or Taylor Swift and please surprise me with additional voices besides these.`,
    })
    turbo(history).then(text => {
      history.push({
        role: 'assistant',
        content: text,
      })
      const json = toJSON(text)
      const { headline, lede, style } = json

      g('headline').textContent = headline
      g('lede').textContent = lede
      g('style').textContent = style

      g('remix').innerHTML = '<i class="fa-regular fa-microchip-ai"></i>Remix'
    })
  } catch (error) {
    console.error(error)
  }
}

g('remix').addEventListener('click', e => {
  if (!shuffledImages.length) {
    shuffledImages = [...imageNames]
    shuffleArray(shuffledImages)
  }

  g(
    'headshot',
  ).style.backgroundImage = `url(https://res.cloudinary.com/dlb7hetnl/image/upload/q_auto/v1695847${shuffledImages.pop()}.jpg)`

  remix()
})
