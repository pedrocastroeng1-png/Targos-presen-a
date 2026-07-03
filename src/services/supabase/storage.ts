import { GeoLocation } from '@/types';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface PhotoMetadata {
  funcionarioId: string;
  projectId: string;
  turno: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm:ss
  operadorId: string;
  location?: GeoLocation;
}

export const storageService = {
  /**
   * Faz o upload de uma foto de presença para o bucket 'attendance-photos' no Supabase.
   */
  async uploadAttendancePhoto(dataUrl: string, metadata: PhotoMetadata): Promise<string> {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const dateObj = new Date();
      const year = format(dateObj, 'yyyy');
      const month = format(dateObj, 'MM');
      const day = format(dateObj, 'dd');
      const timestamp = format(dateObj, 'yyyyMMdd_HHmmss');
      
      const folderTurno = metadata.turno === 'MANHA' ? 'morning' : 'afternoon';

      const fileName = `${metadata.funcionarioId}_${timestamp}.jpg`;
      const filePath = `${year}/${month}/${day}/${metadata.projectId}/${folderTurno}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('attendance-photos')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Save only the file path, not the public URL
      return data.path;
    } catch (error) {
      console.error('Erro no upload da foto:', error);
      throw new Error('Falha ao enviar a fotografia.');
    }
  },

  /**
   * Obtém a URL assinada para visualização (Signed URL)
   */
  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from('attendance-photos')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Erro ao gerar Signed URL:', error);
      throw error;
    }

    return data.signedUrl;
  }
};
