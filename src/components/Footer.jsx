function Footer() {
  return (
    <footer className="bg-transparent py-10 mt-auto print:hidden w-full">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center justify-center gap-4 text-center">
        
        {/* LOGO GRANDE CON LINK A TU WEB */}
        <a 
          href="https://pedialgoar.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 cursor-pointer block"
          title="Ir a PediAlgo"
        >
          <img 
            src="https://res.cloudinary.com/dca2psqfg/image/upload/q_auto/f_auto/v1774900350/logo-largo-pedialgo_u7snto.png" 
            alt="PediAlgo Logo" 
            className="h-20 md:h-24 w-auto object-contain drop-shadow-sm mx-auto" 
          />
        </a>

        {/* TEXTO ACLARATORIO */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">
            Tecnología para locales gastronómicos.
          </p>
          <p className="text-xs text-gray-400">
            Desarrollado por{' '}
            <a 
              href="https://pedialgoar.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-[#F1A139] hover:underline"
            >
              pedialgoar.com
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;