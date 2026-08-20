import { getPayload } from 'payload'
import config from './payload.config' // Importación relativa correcta dentro de /src

const reset = async () => {
  const payload = await getPayload({ config })

  await payload.update({
    collection: 'users', // Cambia el nombre si tu colección de usuarios se llama distinto
    where: {
      email: {
        equals: 'admin@atractivacl.cl', // Pon tu correo exacto
      },
    },
    data: {
      password: '1234',
    },
  })

  console.log('Contraseña actualizada con éxito.')
  process.exit(0)
}

reset()