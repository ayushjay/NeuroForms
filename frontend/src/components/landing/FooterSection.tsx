import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

const FooterSection = () => {
  return (
    <footer className="bg-navy-deep text-primary-foreground/60 py-12 border-t border-navy-light/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
              <Brain className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-primary-foreground">NeuroForms</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/login" className="hover:text-primary-foreground transition-colors">Log In</Link>
            <Link to="/signup" className="hover:text-primary-foreground transition-colors">Sign Up</Link>
            <a href="#features" className="hover:text-primary-foreground transition-colors">Features</a>
          </div>
          <p className="text-xs">© 2026 NeuroForms. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
