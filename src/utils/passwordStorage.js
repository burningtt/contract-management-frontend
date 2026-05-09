const STORAGE_KEY = 'remembered_credentials'
const EXPIRY_DAYS = 30

async function generateKey(secret) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('contract-management-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encrypt(text, secret) {
  const encoder = new TextEncoder()
  const key = await generateKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(text)
  )
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)
  return btoa(String.fromCharCode(...combined))
}

async function decrypt(encryptedBase64, secret) {
  const decoder = new TextDecoder()
  const key = await generateKey(secret)
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  )
  return decoder.decode(decrypted)
}

function getExpiryTimestamp() {
  const now = new Date()
  now.setDate(now.getDate() + EXPIRY_DAYS)
  return now.getTime()
}

function isExpired(expiryTime) {
  return Date.now() > expiryTime
}

function getDeviceSecret() {
  let secret = localStorage.getItem('device_secret')
  if (!secret) {
    secret = crypto.randomUUID()
    localStorage.setItem('device_secret', secret)
  }
  return secret
}

async function saveCredentials(username, password) {
  const secret = getDeviceSecret()
  const encryptedPassword = await encrypt(password, secret)
  const data = {
    username: username,
    encryptedPassword: encryptedPassword,
    expiry: getExpiryTimestamp(),
    remember: true
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function getCredentials() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    return null
  }
  try {
    const parsed = JSON.parse(data)
    if (isExpired(parsed.expiry)) {
      clearCredentials()
      return null
    }
    return parsed
  } catch (e) {
    clearCredentials()
    return null
  }
}

async function getDecryptedCredentials() {
  const stored = getCredentials()
  if (!stored) {
    return null
  }
  try {
    const secret = getDeviceSecret()
    const password = await decrypt(stored.encryptedPassword, secret)
    return {
      username: stored.username,
      password: password
    }
  } catch (e) {
    clearCredentials()
    return null
  }
}

function clearCredentials() {
  localStorage.removeItem(STORAGE_KEY)
}

export default {
  saveCredentials,
  getCredentials,
  getDecryptedCredentials,
  clearCredentials
}
