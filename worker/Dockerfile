FROM node:alpine
USER node
LABEL worker="worker"
WORKDIR /app

# El lockfile TIENE que entrar a la imagen. Sin el, npm resuelve los rangos
# de package.json otra vez y puede traer versiones distintas a las que
# escaneo Snyk: terminariamos analizando un arbol y desplegando otro.
COPY package.json package-lock.json ./

# npm ci instala EXACTAMENTE lo que dice el lockfile (npm install puede
# modificarlo). --omit=dev deja afuera jest/eslint/etc, que no van a
# produccion. --ignore-scripts evita que un paquete ejecute codigo durante
# el build.
RUN npm ci --omit=dev --ignore-scripts

COPY . .
EXPOSE 3000
CMD ["node", "main.js"]