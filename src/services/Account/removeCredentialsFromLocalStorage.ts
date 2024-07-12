export default function removeCredentialsFromLocalStorage() {
  if (typeof window?.localStorage !== 'undefined') {
    localStorage.removeItem('sk')
    localStorage.removeItem('pk')
    localStorage.removeItem('esk')
    localStorage.removeItem('user_vid')
    localStorage.removeItem('jwt')
    localStorage.removeItem('vcjwt')
    localStorage.removeItem('uid')
    localStorage.removeItem('Global')
  }
}
