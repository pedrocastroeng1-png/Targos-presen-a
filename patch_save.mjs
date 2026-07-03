import fs from 'fs';

const content = fs.readFileSync('src/pages/PresencaFlow.tsx', 'utf8');

const regex = /const savePresencaDB = async \(photoPath\?: string\) => \{[\s\S]*?advanceToNext\(\);\n    \} catch \(error: any\) \{/m;

const replacement = `const savePresencaDB = async (photoPath?: string) => {
    if (!currentFuncionario || !user || !obraId) return;
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      let currentSessionId = sessionId;

      if (!currentSessionId && shiftId) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('attendance_sessions')
          .insert({
            project_id: obraId,
            shift_id: shiftId,
            operator_id: user.id,
            attendance_date: today,
            expected_employees: funcionarios.length,
            status: 'EM_ANDAMENTO'
          }).select('id').single();
        
        if (sessionData) {
          currentSessionId = sessionData.id;
          setSessionId(currentSessionId);
        } else if (sessionError && sessionError.code === '23505') {
            const { data: existSess } = await supabase.from('attendance_sessions')
              .select('id').eq('project_id', obraId).eq('shift_id', shiftId).eq('attendance_date', today).single();
            if (existSess) {
               currentSessionId = existSess.id;
               setSessionId(currentSessionId);
            }
        }
      }

      if (!currentSessionId) throw new Error("Could not create session");

      const insertData: any = {
        attendance_session_id: currentSessionId,
        employee_id: currentFuncionario.id,
        status: 'PRESENTE',
        registered_by: user.id,
        registered_at: new Date().toISOString()
      };
      if (photoPath) {
        insertData.photo_path = photoPath;
        insertData.photo_taken_at = new Date().toISOString();
      }
      if (capturedLocation) {
        insertData.latitude = capturedLocation.latitude;
        insertData.longitude = capturedLocation.longitude;
        insertData.gps_accuracy = capturedLocation.accuracy;
      }
      
      const { error } = await supabase.from('attendance_items').insert(insertData);
      if (error && error.code !== '23505') throw error;
      
      setSummary(s => ({ ...s, presentes: s.presentes + 1 }));
      advanceToNext();
    } catch (error: any) {`;

const newContent = content.replace(regex, replacement);
fs.writeFileSync('src/pages/PresencaFlow.tsx', newContent);
