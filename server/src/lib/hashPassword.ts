import crypto from 'crypto'

interface PasswordProps {
  candidatePassword: string
  hash: string
  salt: string
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex')

  return { hash, salt }
}

export function verifyPassword({
  candidatePassword,
  hash,
  salt
}: PasswordProps) {
  const candidateHash = crypto
    .pbkdf2Sync(candidatePassword, salt, 10000, 64, 'sha512')
    .toString('hex')

  const result = candidateHash === hash

  return result
}
