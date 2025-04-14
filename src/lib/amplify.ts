// /lib/amplify.ts
import { Amplify } from 'aws-amplify'
import { amplifyCustomerConfig } from './amplifyCustomerConfig'
import { amplifyAdminConfig } from './amplifyAdminConfig'

export function initAmplify(role: 'customer' | 'admin') {
  const config = role === 'admin' ? amplifyAdminConfig : amplifyCustomerConfig
  Amplify.configure(config)
}
