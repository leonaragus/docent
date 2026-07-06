# Debug Session: camera-permission-flow

Status: OPEN

## Problema
- El grabador muestra que necesita permisos de camara/microfono.
- El modal/prompt del navegador para aprobar permisos no aparece.
- La grabacion no inicia y el flujo queda bloqueado.

## Hipotesis
1. El click no ejecuta realmente `toggleCamera()` o `toggleScreen()`.
2. `getUserMedia()` / `getDisplayMedia()` falla antes de abrir el prompt por constraints incompatibles.
3. Una excepcion previa en el flujo de UI interrumpe la solicitud de permisos.
4. El estado visual no coincide con el estado real del stream.
5. Hay codigo residual en `src/App.tsx` que rompe el flujo antes o despues del pedido de permisos.

## Plan
1. Instrumentar eventos de click y llamadas a permisos.
2. Reproducir y capturar evidencia.
3. Confirmar la hipotesis correcta.
4. Aplicar el fix minimo.
5. Verificar en deploy.

## Hallazgos
- `startRecording()` no solicitaba permisos si no existia `activeStream`; solo mostraba un toast y salia.
- El flujo de permisos dependia de clicks separados en camara/pantalla, por eso el usuario veia el mensaje pero nunca el prompt al usar `Record`.
- Habia constraints de audio demasiado estrictos en `getUserMedia()` / `getDisplayMedia()` que podian rechazar la solicitud antes del modal nativo en algunos navegadores.
- Persistian residuos del flujo viejo de stop/transcripcion que dejaban el archivo inconsistente.

## Fix aplicado
- Se movieron los streams criticos a `useRef` sincronizados con estado para no perder referencias en re-render.
- `Record` ahora solicita camara/microfono automaticamente si todavia no existe un stream activo.
- Se simplificaron los constraints de permisos para maximizar compatibilidad del prompt nativo.
- Se corrigio el loop de canvas para llamar `requestAnimationFrame()` al final.
- Se limpio el flujo de stop y se removio codigo residual de transcripcion offline no usado.

## Estado actual
- Build de produccion: OK
- Deploy de produccion: OK
- Esperando verificacion del usuario en `https://docent-suite-gamma.vercel.app`
