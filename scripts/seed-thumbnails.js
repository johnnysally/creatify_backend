(async function(){
  try{
    const db = require('../models');
    await db.sequelize.authenticate();
    console.log('Connected to DB');
    const services = await db.Service.findAll({limit: 10000});
    console.log('Found', services.length, 'services');

    // Curated mapping from known category names to search queries that tend
    // to return images visually representative of the category. If a
    // category isn't in the map we'll fall back to the raw category name
    // as a query, and finally to a picsum seeded image.
    const categoryMap = {
      'Video Editing': 'video editing montage,camera,editor',
      'Background Music': 'music studio,composer,recording studio',
      '3D Animation': '3d render,3d animation,3d art',
      'Logo Design': 'logo design mockup,brand logo,graphic design logo',
      'Podcast Editing': 'podcast microphone,studio,editing',
      'Stop-Motion': 'stop motion animation,animation set,clay animation',
      'UI/UX Design': 'ui ux design,app ui,design mockup',
      'Explainer Videos': 'explainer video,whiteboard animation,animation',
      'SEO Services': 'seo analytics,search engine optimization,analytics',
      'Brand Identity': 'brand identity,branding mockup,visual identity',
      'Theme Songs': 'music composer,theme song,studio',
      'Digital Illustration': 'digital illustration,illustration art,concept art',
      'Motion Graphics': 'motion graphics,animation studio,mograph',
      'Social Media Marketing': 'social media marketing,content marketing,analytics',
      'Subtitles': 'video captions,subtitles,film editing',
      'Stock Media': 'stock photos,stock video,media library',
      '3D Renders': '3d render,high detail render,3d modeling',
      'NFT Art': 'digital art nft,crypto art,collectible art',
      'App Development': 'app development,coding,app ui',
      'Short Films': 'short film,filmmaking,camera',
      'Blog Writing': 'writing,blogging,keyboard',
      'Mixing & Mastering': 'music mixing mastering,studio mixing board',
      'Product Photography': 'product photography,studio product photo',
      'Photo Retouching': 'photo retouching,photo editing,retouch',
      'Proofreading': 'editing proofreading,red pen,proofreading',
      'Creative Writing': 'creative writing,writer,notebook',
      'Voice Acting': 'voice actor,microphone,recording booth',
      'Sound Effects': 'sound effects,foley studio,recording',
      'Poster & Flyer': 'poster design,flyer design,graphic poster',
      'Ad Videos': 'advertisement video,commercial,ad campaign',
      'YouTube Branding': 'youtube branding,channel art,thumbnail design',
    };

    const makeUrlFor = (service) => {
      const cat = (service.category || '').toString().trim();
      if (!cat) return `https://picsum.photos/seed/${service.id}/800/600`;
      const mapped = categoryMap[cat];
      const query = mapped ? mapped : cat;
      // Choose Unsplash Source with multiple comma-separated keywords for variety
      const q = encodeURIComponent(query);
      return `https://source.unsplash.com/800x600/?${q}`;
    };

    for(const s of services){
      const url = makeUrlFor(s);
      await s.update({ thumbnail: url });
      console.log('Updated', s.id, 'category="' + (s.category||'') + '" ->', url);
    }

    console.log('Done seeding thumbnails');
    process.exit(0);
  }catch(err){
    console.error('Error seeding thumbnails', err);
    process.exit(1);
  }
})();
