import fs from 'fs';

let content = fs.readFileSync('src/pages/PresencaFlow.tsx', 'utf8');

const originalHandlePresente = `  const handlePresente = async () => {
    if (!currentFuncionario || !user || !obraId) return;
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const time = format(new Date(), 'HH:mm:ss');
      
      const { data: existing } = await supabase
        .from('presencas')
        .select('id')
        .eq('funcionario_id', currentFuncionario.id)
        .eq('data', today)
        .single();

      if (existing) {
        const { error } = await supabase.from('presencas').update({
          status: 'PRESENTE',
          valor_pago: 0,
          usuario_id: user.id,
          hora: time
        }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('presencas').insert({
          funcionario_id: currentFuncionario.id,
          obra_id: obraId,
          data: today,
          hora: time,
          usuario_id: user.id,
          status: 'PRESENTE',
          valor_pago: 0,
        });
        if (error) throw error;
      }
      
      setSummary(s => ({ ...s, presentes: s.presentes + 1 }));
      advanceToNext();
    } catch (error: any) {
      console.error('Error recording presence:', error);
      alert('Erro ao registrar presença: ' + error.message);
    }
  };`;

const newHandlePresente = `  const savePresencaDB = async () => {
    if (!currentFuncionario || !user || !obraId) return;
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const time = format(new Date(), 'HH:mm:ss');
      
      const { data: existing } = await supabase
        .from('presencas')
        .select('id')
        .eq('funcionario_id', currentFuncionario.id)
        .eq('data', today)
        .single();

      if (existing) {
        const { error } = await supabase.from('presencas').update({
          status: 'PRESENTE',
          valor_pago: 0,
          usuario_id: user.id,
          hora: time
        }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('presencas').insert({
          funcionario_id: currentFuncionario.id,
          obra_id: obraId,
          data: today,
          hora: time,
          usuario_id: user.id,
          status: 'PRESENTE',
          valor_pago: 0,
        });
        if (error) throw error;
      }
      
      setSummary(s => ({ ...s, presentes: s.presentes + 1 }));
      advanceToNext();
    } catch (error: any) {
      console.error('Error recording presence:', error);
      alert('Erro ao registrar presença: ' + error.message);
    }
  };

  const handlePresente = async () => {
    if (turno === 'MANHA') {
      try {
        const loc = await requestLocation();
        setCapturedLocation(loc);
        setIsCameraOpen(true);
      } catch (err: any) {
        alert(err.message || 'A localização é obrigatória para registrar a presença.');
      }
    } else {
      await savePresencaDB();
    }
  };

  const handlePhotoCapture = (dataUrl: string) => {
    setPhotoPreviewUrl(dataUrl);
    setIsCameraOpen(false);
  };

  const confirmPresenteWithPhoto = async () => {
    if (!photoPreviewUrl || !user || !currentFuncionario || !obra) return;
    
    setUploadingPhoto(true);
    try {
      const photoUrl = await storageService.uploadAttendancePhoto(photoPreviewUrl, {
        funcionarioId: currentFuncionario.id,
        obraId: obra.id,
        turno: turno || 'MANHA',
        data: format(new Date(), 'yyyy-MM-dd'),
        hora: format(new Date(), 'HH:mm:ss'),
        operadorId: user.id,
        location: capturedLocation || undefined,
      });
      // Path salvo com sucesso. Avança o funcionário.
      await savePresencaDB();
      setPhotoPreviewUrl(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Falha ao enviar a fotografia.');
    } finally {
      setUploadingPhoto(false);
    }
  };
`;

if (content.includes(originalHandlePresente)) {
  content = content.replace(originalHandlePresente, newHandlePresente);
} else {
  console.log("Could not find originalHandlePresente");
}

fs.writeFileSync('src/pages/PresencaFlow.tsx', content);
