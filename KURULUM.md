# Kurulum (Android tablet, sırayla)
Mevcut Netlify sitenize ve GitHub depolarınıza DOKUNMAYIN; her şey yeni bir depo ve yeni bir Netlify projesidir.
1. **GitHub:** github.com > New repository > ad: `tip-calisma-merkezi` (Private). ZIP'i açıp dosyaları "Add file > Upload files" ile yükleyin. `.env` dosyası yüklemeyin (yalnızca `.env.example` vardır).
2. **Cloudflare R2:** dash.cloudflare.com > R2 > Create bucket (`slaytlar`). Bucket > Settings > CORS: izin verilen origin = Netlify site adresiniz, metod = PUT, header = *. R2 > Manage API Tokens > Object Read & Write token oluşturup Access Key ID / Secret / Account ID'yi not edin. (R2 tek PUT ile 5 GB'a kadar kabul eder; 100 MB için parçalı yükleme gerekmez. Ücretsiz dilim: 10 GB depolama.)
3. **Anthropic:** console.anthropic.com > API Keys > Create key. (Ayrı faturalandırma; harcama limiti belirleyin.)
4. **Netlify:** app.netlify.com > Add new site > Import from GitHub > yeni depo. Build ayarları `netlify.toml`'dan gelir.
5. Site configuration > Environment variables: `.env.example` içindeki tüm değişkenleri girin; `APP_PASSWORD` için kendi parolanızı belirleyin. Sonra Deploys > Trigger deploy.
6. Siteyi açın, slayt sayfasında parolayı girin.
