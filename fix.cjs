const fs = require('fs');

let c = fs.readFileSync('src/components/Admin/DocentAdmin.tsx', 'utf8');

const replacements = {
  'Gestin': 'Gestión',
  'YZ"': '🏫',
  'Estǭ': '¿Está',
  'desasignarǭn': 'desasignarán',
  'borrarǭn': 'borrarán',
  'accin': 'acción',
  'configuracin': 'configuración',
  'perderǭn': 'perderán',
  's?': '¿Sí?',
  'iniciarǭ': 'iniciará',
  'vaca': 'vacía',
  'prximo': 'próximo',
  'maana': 'mañana',
  'das': 'días',
  'sltimo': 'Último',
  'Aplicacin': 'Aplicación',
  'Sesin': 'Sesión',
  'Institucin': 'Institución',
  'vaco': 'vacío',
  'Estǭs': 'Estás',
  'estǭ': 'está',
  'guardarǭn': 'guardarán',
  'sincronizacin': 'sincronización',
  'electrnico': 'electrónico',
  'contrasea': 'contraseña',
  'opcin': 'opción',
  'Listo!': '¡Listo!',
  'podrǭ': 'podrá',
  'Gua': 'Guía',
  'Activacin': 'Activación',
  'Cmo': '¿Cómo',
  'Da': 'Día',
  'cmo': 'cómo',
  'automǭticamente': 'automáticamente',
  'Y"<': '📖',
  '': 'á', // For leftover bad chars
};

for (const [bad, good] of Object.entries(replacements)) {
  c = c.split(bad).join(good);
}

// Fix standard spanish characters that became weird characters
c = c.replace(/Gestin/g, 'Gestión')
     .replace(/Est/g, '¿Está')
     .replace(/desasignarn/g, 'desasignarán')
     .replace(/borrarn/g, 'borrarán')
     .replace(/accin/g, 'acción')
     .replace(/configuracin/g, 'configuración')
     .replace(/perdern/g, 'perderán')
     .replace(/s\?/g, '¿Sí?')
     .replace(/iniciar/g, 'iniciará')
     .replace(/vaca/g, 'vacía')
     .replace(/prximo/g, 'próximo')
     .replace(/maana/g, 'mañana')
     .replace(/das/g, 'días')
     .replace(/sltimo/g, 'Último')
     .replace(/Aplicacin/g, 'Aplicación')
     .replace(/Sesin/g, 'Sesión')
     .replace(/Institucin/g, 'Institución')
     .replace(/vaco/g, 'vacío')
     .replace(/Ests/g, 'Estás')
     .replace(/est/g, 'está')
     .replace(/guardarn/g, 'guardarán')
     .replace(/sincronizacin/g, 'sincronización')
     .replace(/electrnico/g, 'electrónico')
     .replace(/contrasea/g, 'contraseña')
     .replace(/opcin/g, 'opción')
     .replace(/Listo!/g, '¡Listo!')
     .replace(/podr/g, 'podrá')
     .replace(/Gua/g, 'Guía')
     .replace(/Activacin/g, 'Activación')
     .replace(/Cmo/g, '¿Cómo')
     .replace(/Da/g, 'Día')
     .replace(/cmo/g, 'cómo')
     .replace(/automticamente/g, 'automáticamente');

fs.writeFileSync('src/components/Admin/DocentAdmin.tsx', c);
