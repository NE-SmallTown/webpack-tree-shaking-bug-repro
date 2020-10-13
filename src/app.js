import React from 'react'
import { UI } from '@hyext/hy-ui'
//import { View, Text } from '@hyext/hy-ui/dist/components/base'
import { funcB } from './foo'

import './app.hycss'

const { View, Text } = UI

class CommonApp extends React.Component {
  render() {
    console.log(12312321123, 'render')

    return (
      <View className='container'>
        <Text className='text'>Hellllllllo</Text>
      </View>
    )
  }
}

funcB()

export default CommonApp
