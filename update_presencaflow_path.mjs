import fs from 'fs';

let content = fs.readFileSync('src/pages/PresencaFlow.tsx', 'utf8');

const oldSaveDB = `  const savePresencaDB = async () => {`;
const newSaveDB = `  const savePresencaDB = async (photoPath?: string) => {`;
content = content.replace(oldSaveDB, newSaveDB);

const oldUpdate = `        const { error } = await supabase.from('presencas').update({
          status: 'PRESENTE',
          valor_pago: 0,
          usuario_id: user.id,
          hora: time
        }).eq('id', existing.id);`;
const newUpdate = `        const updateData: any = {
          status: 'PRESENTE',
          valor_pago: 0,
          usuario_id: user.id,
          hora: time
        };
        if (photoPath) updateData.foto_path = photoPath;

        const { error } = await supabase.from('presencas').update(updateData).eq('id', existing.id);`;
content = content.replace(oldUpdate, newUpdate);

const oldInsert = `        const { error } = await supabase.from('presencas').insert({
          funcionario_id: currentFuncionario.id,
          obra_id: obraId,
          data: today,
          hora: time,
          usuario_id: user.id,
          status: 'PRESENTE',
          valor_pago: 0,
        });`;
const newInsert = `        const insertData: any = {
          funcionario_id: currentFuncionario.id,
          obra_id: obraId,
          data: today,
          hora: time,
          usuario_id: user.id,
          status: 'PRESENTE',
          valor_pago: 0,
        };
        if (photoPath) insertData.foto_path = photoPath;

        const { error } = await supabase.from('presencas').insert(insertData);`;
content = content.replace(oldInsert, newInsert);

const oldAwait = `      await savePresencaDB();
      setPhotoPreviewUrl(null);`;
const newAwait = `      await savePresencaDB(photoUrl);
      setPhotoPreviewUrl(null);`;
content = content.replace(oldAwait, newAwait);

fs.writeFileSync('src/pages/PresencaFlow.tsx', content);
