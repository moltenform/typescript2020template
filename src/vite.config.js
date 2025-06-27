
import checker from 'vite-plugin-checker'

export default {
  // config options
  build: {
    sourcemap: true,
  },
   plugins: [!process.env.VITEST ? checker({ typescript: true }) : undefined],
}


