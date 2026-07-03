import fs from 'fs';

let content = fs.readFileSync('src/pages/AdminAuditoria.tsx', 'utf8');

content = content.replace(
  "import { Search, MapPin, Clock, Calendar, User, Camera, Building2, UserCircle2 } from 'lucide-react';",
  "import { Search, MapPin, Clock, Calendar, User, Camera, Building2, UserCircle2 } from 'lucide-react';\nimport { storageService } from '@/services/supabase/storage';\nimport { useEffect } from 'react';"
);

content = content.replace(
  "const [selectedFoto, setSelectedFoto] = useState<AuditoriaFoto | null>(null);",
  "const [selectedFoto, setSelectedFoto] = useState<AuditoriaFoto | null>(null);\n  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(null);\n\n  useEffect(() => {\n    if (selectedFoto) {\n      if (selectedFoto.url && !selectedFoto.url.startsWith('http')) {\n        storageService.getSignedUrl(selectedFoto.url).then(setSignedPhotoUrl).catch(() => setSignedPhotoUrl(null));\n      } else {\n        setSignedPhotoUrl(selectedFoto.url);\n      }\n    } else {\n      setSignedPhotoUrl(null);\n    }\n  }, [selectedFoto]);"
);

content = content.replace(
  "src={selectedFoto.url}",
  "src={signedPhotoUrl || ''}"
);

fs.writeFileSync('src/pages/AdminAuditoria.tsx', content);
