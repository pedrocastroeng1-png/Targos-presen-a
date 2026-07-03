const fs = require('fs');

let content = fs.readFileSync('src/pages/PresencaFlow.tsx', 'utf8');

const importsToAdd = `
import { useGeolocation } from '@/hooks/useGeolocation';
import { storageService } from '@/services/supabase/storage';
import { CameraCapture } from '@/components/CameraCapture';
import { GeoLocation } from '@/types';
`;

content = content.replace(
  "import { CheckCircle2, XCircle, Clock, Building, UserSquare2, ChevronLeft, UserMinus, Timer, Check, Users } from 'lucide-react';",
  "import { CheckCircle2, XCircle, Clock, Building, UserSquare2, ChevronLeft, UserMinus, Timer, Check, Users, Camera as CameraIcon } from 'lucide-react';\n" + importsToAdd
);

content = content.replace(
  "const { profile } = useAuth();",
  "const { profile, user } = useAuth();"
);

const stateVars = `
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<GeoLocation | null>(null);
  const { requestLocation, loading: locationLoading } = useGeolocation();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
`;

content = content.replace(
  "const [observacao, setObservacao] = useState('');",
  "const [observacao, setObservacao] = useState('');\n" + stateVars
);

const handlePresenteReplacement = `
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
      await savePresenca('PRESENTE');
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
      // In next phase, photoUrl will be saved to the database.
      await savePresenca('PRESENTE');
      setPhotoPreviewUrl(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };
`;

content = content.replace(
  "const handlePresente = () => savePresenca('PRESENTE');",
  handlePresenteReplacement
);


const cameraModals = `
      {/* Camera Modal */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent overflow-hidden">
          <DialogTitle className="sr-only">Câmera</DialogTitle>
          <CameraCapture 
            onCapture={handlePhotoCapture} 
            onCancel={() => setIsCameraOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Photo Preview Modal */}
      <Dialog open={!!photoPreviewUrl} onOpenChange={(open) => !open && !uploadingPhoto && setPhotoPreviewUrl(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white">
          <DialogTitle className="sr-only">Confirmação de Foto</DialogTitle>
          <div className="bg-white">
            <img src={photoPreviewUrl || ''} alt="Preview" className="w-full h-auto max-h-[50vh] object-contain bg-black" />
            <div className="p-4 space-y-2 text-sm text-gray-700 bg-gray-50 border-t">
              <p><strong>Funcionário:</strong> {currentFuncionario?.nome}</p>
              <p><strong>Obra:</strong> {obra?.nome}</p>
              <p><strong>Turno:</strong> {turno === 'MANHA' ? 'MANHÃ' : 'TARDE'}</p>
              <p><strong>Data:</strong> {format(new Date(), 'dd/MM/yyyy')}</p>
              <p><strong>Hora:</strong> {format(new Date(), 'HH:mm')}</p>
            </div>
            <div className="p-4 flex gap-3 bg-white border-t">
              <Button variant="outline" className="flex-1" onClick={() => { setPhotoPreviewUrl(null); setIsCameraOpen(true); }} disabled={uploadingPhoto}>
                TIRAR NOVAMENTE
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold" onClick={confirmPresenteWithPhoto} disabled={uploadingPhoto}>
                {uploadingPhoto ? 'SALVANDO...' : 'USAR FOTO'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
`;

content = content.replace(
  "{/* Faltou Modal */}",
  cameraModals + "\n      {/* Faltou Modal */}"
);

content = content.replace(
  "PRESENTE",
  "{locationLoading ? 'OBTENDO GPS...' : 'PRESENTE'}"
);


fs.writeFileSync('src/pages/PresencaFlow.tsx', content);
