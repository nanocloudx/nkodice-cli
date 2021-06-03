// NKODICE CLI

console.clear()
console.log('--------------------------------------------------')
console.log('NKODICE CLI')

playTurn({
  score: 0,
  diceCount: 5,
  turnCount: 1,
  continueCount: 2,
  faces: [],
  diceU: 0,
  diceO: 0,
  diceKO: 0,
  diceCHI: 0,
  diceMA: 0,
  diceN: 0,
  combo: {
    OCHINCHIN: 0,
    CHINCHIN: 0,
    OMANKO: 0,
    MANKO: 0,
    CHINKO: 0,
    UNCHI: 0,
    UNKO: 0,
  }
})

/**
 * ターンを実行する
 */
function playTurn(status: Status) {
  console.log('--------------------------------------------------')
  if (isNaN(status.diceCount) || status.diceCount < 3 || status.diceCount > 100) {
    console.log('Invalid dice count (3~100)')
    return
  }

  console.log(`Roll: ${status.turnCount} (Continue: ${status.continueCount})`)
  console.log(`Dice: ${status.diceCount}`)
  console.log('')

  let currentStatus = rollDice(status)
  currentStatus = judgeFaces(currentStatus)
  currentStatus = judgeWords(currentStatus)
  currentStatus = judgeTriples(currentStatus)

  console.log(`Score: ${Math.ceil(currentStatus.score)}`)

  if (currentStatus.continueCount === 0) {
    gameover(currentStatus)
    return
  }

  const answer = prompt('Do you want continue?(Y/n)')

  if (answer !== null && answer !== 'Y' && answer !== 'y') {
    gameover(currentStatus)
    return
  }

  playTurn({
    ...currentStatus,
    turnCount: currentStatus.turnCount + 1,
    continueCount: currentStatus.continueCount - 1
  })
}

function gameover(status: Status) {
  console.log('--------------------------------------------------')
  console.log('GAMEOVER!')
  console.log(`TotalScore: ${Math.ceil(status.score)}`)
  console.log('--------------------------------------------------')
}

/**
 * ダイスを振る
 */
function rollDice(status: Status): Status {
  const d = ['う', 'ま', 'ち', 'お', 'こ', 'ん', '-']
  const faces = [...Array(status.diceCount)].map(() => d[Math.floor(Math.random() * d.length)]).sort()
  return {
    ...status,
    faces,
    diceU: faces.filter(d => d === 'う').length,
    diceMA: faces.filter(d => d === 'ま').length,
    diceCHI: faces.filter(d => d === 'ち').length,
    diceO: faces.filter(d => d === 'お').length,
    diceKO: faces.filter(d => d === 'こ').length,
    diceN: faces.filter(d => d === 'ん').length,
  }
}

/**
 * ダイスの目を判定する
 */
function judgeFaces(status: Status): Status {
  let facesScore = status.score
  status.faces.map(d => {
    switch(d) {
      case 'う':
        console.log('う +500')
        facesScore += 500
        break
      case 'ま':
        console.log('ま +500')
        facesScore += 500
        break
      case 'ち':
        console.log('ち +500')
        facesScore += 500
        break
      case 'お':
        console.log('お +300')
        facesScore += 300
        break
      case 'こ':
        console.log('こ +100')
        facesScore += 100
        break
      case 'ん':
        console.log('ん +50')
        facesScore += 50
        break
      case '-':
        console.log('Ｘ -500')
        facesScore -= 500
    }
  })
  console.log('')
  return {
    ...status,
    score: facesScore
  }
}

/**
 * コンボに応じたスコアを取得する
 */
function getWordScore(baseScore: number, count: number) {
  switch (count) {
    case 0:
    case 1:
      return baseScore * 1
    case 2:
      return baseScore * 2
    case 3:
      return baseScore * 4
    default:
      return baseScore * 8
  }
}

/**
 * ダイスの役を判定する
 */
function judgeWords(status: Status): Status {
  let wordsScore = status.score
  let detectWordCount = 0
  const combo = Object.assign({}, status.combo)

  // OCHINCHIN or CHINCHIN
  if (status.diceO >= 1 && status.diceCHI >= 2 && status.diceN >= 2) {
    combo.OCHINCHIN++
    combo.CHINCHIN = 0
    const ws = getWordScore(10000, combo.OCHINCHIN)
    console.log(`OCHINCHIN +${ws} (${combo.OCHINCHIN} COMBO)`)
    wordsScore += ws
    detectWordCount++
  } else if (status.diceCHI >= 2 && status.diceN >= 2) {
    combo.CHINCHIN++
    combo.OCHINCHIN = 0
    const ws = getWordScore(3000, combo.CHINCHIN)
    console.log(`CHINCHIN +${ws} (${combo.CHINCHIN} COMBO)`)
    wordsScore += ws
    detectWordCount++
  } else {
    combo.OCHINCHIN = 0
    combo.CHINCHIN = 0
  }

  // OMANKO or MANKO
  if (status.diceO >= 1 && status.diceMA >= 1 && status.diceN >= 1 && status.diceKO >= 1) {
    combo.OMANKO++
    combo.MANKO = 0
    const ws = getWordScore(5000, combo.OMANKO)
    console.log(`OMANKO +${ws} (${combo.OMANKO} COMBO)`)
    wordsScore += ws
    detectWordCount++
  } else if (status.diceMA >= 1 && status.diceN >= 1 && status.diceKO >= 1) {
    combo.MANKO++
    combo.OMANKO = 0
    const ws = getWordScore(1000, combo.MANKO)
    console.log(`MANKO +${ws} (${combo.MANKO} COMBO)`)
    wordsScore += ws
    detectWordCount++
  } else {
    combo.OMANKO = 0
    combo.MANKO = 0
  }

  // CHINKO
  if (status.diceCHI >= 1 && status.diceN >= 1 && status.diceKO >= 1) {
    combo.CHINKO++
    const ws = getWordScore(1000, combo.CHINKO)
    console.log(`CHINKO +${ws} (${combo.CHINKO} COMBO)`)
    wordsScore += ws
    detectWordCount++
  } else {
    combo.CHINKO = 0
  }

  // UNCHI
  if (status.diceU >= 1 && status.diceN >= 1 && status.diceCHI >= 1) {
    combo.UNCHI++
    const ws = getWordScore(1000, combo.UNCHI)
    console.log(`UNCHI +${ws} (${combo.UNCHI} COMBO)`)
    wordsScore += ws
    detectWordCount++
  } else {
    combo.UNCHI = 0
  }

  // UNKO
  if (status.diceU >= 1 && status.diceN >= 1 && status.diceKO >= 1) {
    combo.UNKO++
    const ws = getWordScore(1000, combo.UNKO)
    console.log(`UNKO +${ws} (${combo.UNKO} COMBO)`)
    wordsScore += ws
    detectWordCount++
  } else {
    combo.UNKO = 0
  }

  if (status.score !== wordsScore) {
    console.log('')
  }

  let diceCount = status.diceCount
  // 複数の役が成立した場合2つ目の役から次回のダイス数+1
  if (detectWordCount >= 2) {
    diceCount = 4 + detectWordCount
  } else {
    diceCount = 5
  }
  // おちんちん成立時は次回のダイス数10
  if (combo.OCHINCHIN) {
    diceCount = 10
  }

  let continueCount = status.continueCount
  // 役が1つ以上成立すると残りターン数+1
  if (detectWordCount >= 1) {
    continueCount++
  }

  return {
    ...status,
    combo,
    diceCount,
    continueCount,
    score: wordsScore,
  }
}

/**
 * ダイスのゾロ目を判定する
 */
function judgeTriples(status: Status): Status {
  let triplesScore = status.score
  // TRIPLE U
  if (status.diceU >= 3) {
    console.log('TRIPLE U *200%')
    triplesScore *= 2
  }
  // TRIPLE MA
  if (status.diceMA >= 3) {
    console.log('TRIPLE MA *200%')
    triplesScore *= 2
  }
  // TRIPLE CHI
  if (status.diceCHI >= 3) {
    console.log('TRIPLE CHI *200%')
    triplesScore *= 2
  }
  // TRIPLE O (正数になる)
  if (status.diceO >= 3) {
    console.log('TRIPLE O *150%')
    triplesScore *= 1.5
    triplesScore = Math.abs(triplesScore)
  }
  // TRIPLE KO
  if (status.diceKO >= 3) {
    console.log('TRIPLE KO *150%')
    triplesScore *= 1.5
  }
  // TRIPLE N
  if (status.diceN >= 3) {
    console.log('TRIPLE N *-300%')
    triplesScore *= -3
  }
  if (status.score !== triplesScore) {
    console.log('')
  }
  return {
    ...status,
    score: triplesScore
  }
}

type Status = {
  score: number
  diceCount: number
  turnCount: number
  continueCount: number
  faces: string[]
  diceU: number
  diceO: number
  diceKO: number
  diceCHI: number
  diceMA: number
  diceN: number
  combo: {
    OCHINCHIN: number,
    CHINCHIN: number,
    OMANKO: number,
    MANKO: number,
    CHINKO: number,
    UNCHI: number,
    UNKO: number
  }
}
