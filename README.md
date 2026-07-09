# ETHIO-AI | Ethiopian AI Music, Cyberpunk Entertainment & Digital Culture

A futuristic Ethiopian AI music and entertainment platform featuring cyberpunk visuals, immersive digital experiences, and AI-powered music recommendations.

## 🌟 Features

- **AI Music Player**: Stream futuristic Ethiopian-inspired music
- **Cyberpunk Visuals**: Interactive particle animations and neon effects
- **Music Recommendations**: AI-powered mood-based music suggestions
- **Artist Profiles**: Showcase Ethiopian artists and creators
- **User Dashboard**: Personalized user experience with favorites and playlists
- **Firebase Integration**: Real-time authentication and data management
- **Responsive Design**: Mobile-friendly interface for all devices

## 🚀 Live Deployments

- **GitHub Pages**: https://millionfikru6-max.github.io/ETHIO-AI/
- **Netlify**: https://ethio-ai.netlify.app/

## 📁 Project Structure

```
ETHIO-AI/
├── index.html           # Main HTML file
├── style.css            # Stylesheet with cyberpunk design
├── script.js            # JavaScript functionality
├── favicon.png          # Website icon
├── profile.png          # Artist profile images
├── loyal.m4a            # Audio files
├── mystical.m4a
├── chanel.m4a
├── robots.txt           # SEO configuration
├── sitemap.xml          # Site map for search engines
├── .netlify.toml        # Netlify deployment configuration
└── README.md            # This file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables and animations
- **JavaScript**: Interactive functionality
- **Firebase**: Authentication and real-time database
- **Canvas API**: Particle background animations

## 📋 Installation & Setup

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/millionfikru6-max/ETHIO-AI.git
cd ETHIO-AI
```

2. Open in a local server (required for some features):
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server
```

3. Visit `http://localhost:8000` in your browser

### GitHub Pages Deployment

The site is automatically deployed to GitHub Pages from the `main` branch.

To deploy your own fork:
1. Push changes to your repository
2. GitHub Pages will automatically build and deploy
3. Access at `https://yourusername.github.io/ETHIO-AI/`

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Netlify will automatically detect the `.netlify.toml` configuration
3. Deploy with a single click
4. Configure custom domain in Netlify settings

## 🔧 Configuration

### Firebase Setup

The Firebase configuration is included in `script.js`. To use your own Firebase project:

1. Create a Firebase project at https://firebase.google.com
2. Update the `firebaseConfig` object in `script.js` with your credentials
3. Enable Authentication and Firestore in Firebase Console
4. Set up appropriate security rules

### Environment Variables

For production deployments, consider using environment variables for sensitive data:

```javascript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  // ... other config
};
```

## 🎨 Customization

### Colors

Edit CSS variables in `style.css`:

```css
:root {
  --bg: #050505;           /* Background color */
  --blue: #00f2ff;         /* Primary accent */
  --purple: #bc13fe;       /* Secondary accent */
  --glass: rgba(...);      /* Glass morphism effect */
}
```

### Content

- Edit `index.html` to modify page content
- Update artist profiles in the "Featured Artists" section
- Add new music tracks in the "AI Music Player" section

### Styling

- Modify `style.css` for visual changes
- Update responsive breakpoints for different screen sizes
- Customize animations and transitions

## 🔐 Security

- Firebase API keys are public (safe for client-side)
- Always configure Firebase Security Rules in the Firebase Console
- Never commit sensitive credentials to version control
- Use HTTPS for all deployments (GitHub Pages and Netlify provide this by default)

## 🐛 Troubleshooting

### Firebase Not Connecting
- Check browser console for errors
- Verify Firebase credentials in `script.js`
- Ensure Firebase project is active

### Audio Not Playing
- Check browser console for CORS errors
- Verify audio file paths are correct
- Ensure audio files are properly uploaded

### Responsive Issues
- Clear browser cache
- Test in incognito/private mode
- Check mobile device viewport settings

## 📊 Performance Optimization

- Lazy load images using `loading="lazy"`
- Optimize audio files for web
- Minimize CSS and JavaScript
- Use CDN for external resources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Million Fikru**
- Founder & Creative Director of ETHIO-AI
- Email: millionfikru6@gmail.com
- GitHub: [@millionfikru6-max](https://github.com/millionfikru6-max)

## 🙏 Acknowledgments

- Firebase for authentication and database services
- Unsplash for high-quality images
- The Ethiopian creative community for inspiration

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: millionfikru6@gmail.com
- Check the DEBUG_REPORT.md for known issues and fixes

---

**Status**: ✅ Production Ready

Last Updated: July 10, 2026
