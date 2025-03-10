export default {
  esbuild: {
    jsxInject: `import React from 'react'`,
    jsx: 'automatic',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
} 