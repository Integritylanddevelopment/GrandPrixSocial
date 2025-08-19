"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Info, Shield, Brain, Users, Palette, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

interface ConsentSettings {
  coreService: boolean;
  aiPersonalization: boolean;
  behaviorTracking: boolean;
  socialIntelligence: boolean;
  interfaceCustomization: boolean;
  analyticsInsights: boolean;
  dataRetention: '30days' | '6months' | '2years';
  marketingCommunication: boolean;
}

interface ComprehensiveConsentProps {
  onConsentComplete: (settings: ConsentSettings) => void;
  onDeclineAll: () => void;
}

export function ComprehensiveConsent({ onConsentComplete, onDeclineAll }: ComprehensiveConsentProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [consent, setConsent] = useState<ConsentSettings>({
    coreService: true, // Required for basic functionality
    aiPersonalization: false,
    behaviorTracking: false,
    socialIntelligence: false,
    interfaceCustomization: false,
    analyticsInsights: false,
    dataRetention: '30days',
    marketingCommunication: false
  });

  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleConsentChange = (key: keyof ConsentSettings, value: boolean | string) => {
    setConsent(prev => ({ ...prev, [key]: value }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Brain className="w-16 h-16 mx-auto text-blue-500" />
        <h2 className="text-3xl font-bold font-orbitron">Welcome to AI-Enhanced F1</h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto font-rajdhani">
          Grand Prix Social uses intelligent systems to create personalized F1 experiences. 
          Let's set up your preferences to ensure you're comfortable with how we enhance your journey.
        </p>
      </div>

      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-green-400 mt-1" />
            <div>
              <h3 className="font-bold text-green-400 mb-2 font-rajdhani">Your Privacy, Your Control</h3>
              <p className="text-gray-300 text-sm font-rajdhani">
                We believe in transparent AI. Every feature is optional, every data use is explained, 
                and you can change your mind at any time. No dark patterns, no hidden tracking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-200 font-rajdhani">
            <strong>Legal Notice:</strong> By using Grand Prix Social, you agree that your interactions 
            may be processed by our AI systems to enhance your experience. All processing is secure, 
            private, and under your control. You can opt-out at any time.
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          onClick={() => setCurrentStep(2)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg font-semibold font-rajdhani"
        >
          Let's Customize My Experience
        </Button>
        <Button 
          onClick={onDeclineAll}
          variant="outline"
          className="px-8 py-3 text-lg font-rajdhani"
        >
          Just Basic F1 Please
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-orbitron">AI-Powered Features</h2>
        <p className="text-gray-400 font-rajdhani">Choose which intelligent features enhance your F1 experience</p>
      </div>

      <div className="grid gap-4">
        {/* AI Personalization */}
        <Card className="hover:border-purple-500/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-lg font-rajdhani">Smart Content Recommendations</CardTitle>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">Popular</Badge>
              </div>
              <Checkbox 
                checked={consent.aiPersonalization}
                onCheckedChange={(checked) => handleConsentChange('aiPersonalization', checked as boolean)}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-300 mb-3 font-rajdhani">
              Get F1 news, posts, and content tailored to your favorite teams and drivers.
            </p>
            
            <div className="space-y-2 text-sm text-gray-400 font-rajdhani">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Shows you Ferrari news if you're a Ferrari fan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Highlights posts about your favorite drivers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Learns from what you read and like</span>
              </div>
            </div>

            <button 
              onClick={() => toggleSection('aiDetails')}
              className="text-blue-400 text-sm mt-3 hover:underline flex items-center gap-1 font-rajdhani"
            >
              <Info className="w-4 h-4" />
              How does this work?
            </button>
            
            {expandedSections.includes('aiDetails') && (
              <div className="mt-3 p-3 bg-blue-500/10 rounded-md border border-blue-500/20 text-sm text-gray-300 font-rajdhani">
                Our AI analyzes your reading patterns, likes, and comments to understand your F1 interests. 
                We track page visits, time spent reading, and interaction patterns. This data stays in your 
                profile and helps us show you more relevant content. You can see and delete this data anytime.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Intelligence */}
        <Card className="hover:border-green-500/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-400" />
                <CardTitle className="text-lg font-rajdhani">Intelligent Social Matching</CardTitle>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">Community</Badge>
              </div>
              <Checkbox 
                checked={consent.socialIntelligence}
                onCheckedChange={(checked) => handleConsentChange('socialIntelligence', checked as boolean)}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-300 mb-3 font-rajdhani">
              Connect with F1 fans who share your team loyalties and racing interests.
            </p>
            
            <div className="space-y-2 text-sm text-gray-400 font-rajdhani">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Find Ferrari fans if you love Ferrari</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Suggest fantasy league partners</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Recommend local F1 communities</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interface Customization */}
        <Card className="hover:border-yellow-500/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-yellow-400" />
                <CardTitle className="text-lg font-rajdhani">Personalized Interface</CardTitle>
              </div>
              <Checkbox 
                checked={consent.interfaceCustomization}
                onCheckedChange={(checked) => handleConsentChange('interfaceCustomization', checked as boolean)}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-300 mb-3 font-rajdhani">
              Customize colors, themes, and layout based on your F1 team preferences.
            </p>
            
            <div className="space-y-2 text-sm text-gray-400 font-rajdhani">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                <span>Ferrari red accents for Ferrari fans</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <span>Prioritize your most-used features</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                <span>Adapt navigation to your habits</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Behavioral Tracking Toggle */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <CardTitle className="text-lg font-rajdhani">Advanced Behavioral Learning</CardTitle>
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">Optional</Badge>
              </div>
              <Checkbox 
                checked={consent.behaviorTracking}
                onCheckedChange={(checked) => handleConsentChange('behaviorTracking', checked as boolean)}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-300 mb-3 font-rajdhani">
              Enable detailed interaction tracking for the most personalized experience.
            </p>
            
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-200 font-rajdhani">
                This tracks mouse movements, scroll patterns, and detailed reading behavior. 
                Only enable if you want maximum personalization. All data is encrypted and private to you.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={() => setCurrentStep(1)}
          variant="outline"
          className="font-rajdhani"
        >
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep(3)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-rajdhani"
        >
          Continue to Data Settings
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-orbitron">Data & Privacy Controls</h2>
        <p className="text-gray-400 font-rajdhani">Fine-tune how your data is handled</p>
      </div>

      <div className="grid gap-4">
        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-rajdhani">
              <Shield className="w-5 h-5 text-blue-400" />
              Data Retention Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4 font-rajdhani">
              How long should we keep your behavioral data for personalization?
            </p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="retention" 
                  value="30days"
                  checked={consent.dataRetention === '30days'}
                  onChange={(e) => handleConsentChange('dataRetention', e.target.value)}
                  className="text-blue-500"
                />
                <div>
                  <div className="font-medium font-rajdhani">30 Days</div>
                  <div className="text-sm text-gray-400 font-rajdhani">Most private - basic personalization</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="retention" 
                  value="6months"
                  checked={consent.dataRetention === '6months'}
                  onChange={(e) => handleConsentChange('dataRetention', e.target.value)}
                  className="text-blue-500"
                />
                <div>
                  <div className="font-medium font-rajdhani">6 Months</div>
                  <div className="text-sm text-gray-400 font-rajdhani">Balanced - good personalization with privacy</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="retention" 
                  value="2years"
                  checked={consent.dataRetention === '2years'}
                  onChange={(e) => handleConsentChange('dataRetention', e.target.value)}
                  className="text-blue-500"
                />
                <div>
                  <div className="font-medium font-rajdhani">2 Years</div>
                  <div className="text-sm text-gray-400 font-rajdhani">Maximum personalization and insights</div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Communications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-rajdhani">
                <Info className="w-5 h-5 text-purple-400" />
                F1 Updates & Insights
              </CardTitle>
              <Checkbox 
                checked={consent.marketingCommunication}
                onCheckedChange={(checked) => handleConsentChange('marketingCommunication', checked as boolean)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 font-rajdhani">
              Receive personalized F1 insights, race predictions, and community highlights based on your interests.
            </p>
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2 font-rajdhani">
              <AlertTriangle className="w-5 h-5" />
              Important Legal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-300 font-rajdhani">
              <strong>By enabling AI features, you consent to:</strong>
            </div>
            <ul className="space-y-1 text-sm text-gray-400 font-rajdhani">
              <li>• Processing of your behavioral data for personalization</li>
              <li>• Storage of interaction patterns in our secure memory system</li>
              <li>• Use of AI algorithms to generate recommendations</li>
              <li>• Analysis of your F1 preferences and social interactions</li>
            </ul>
            <div className="text-sm text-blue-200 font-rajdhani">
              <strong>Your Rights:</strong> You can withdraw consent, delete data, or disable features anytime 
              in your profile settings. All processing complies with GDPR and CCPA regulations.
            </div>
          </CardContent>
        </Card>

        {/* Summary of Choices */}
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400 font-rajdhani">Your Privacy Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-rajdhani">
              <div className="flex justify-between">
                <span>AI Personalization:</span>
                <span className={consent.aiPersonalization ? "text-green-400" : "text-gray-400"}>
                  {consent.aiPersonalization ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Social Matching:</span>
                <span className={consent.socialIntelligence ? "text-green-400" : "text-gray-400"}>
                  {consent.socialIntelligence ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Interface Customization:</span>
                <span className={consent.interfaceCustomization ? "text-green-400" : "text-gray-400"}>
                  {consent.interfaceCustomization ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Data Retention:</span>
                <span className="text-blue-400 capitalize">{consent.dataRetention.replace('days', ' days')}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 rounded-md border border-blue-500/20 text-sm text-blue-200 font-rajdhani">
              💡 You can change these settings anytime in your profile privacy controls
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={() => setCurrentStep(2)}
          variant="outline"
          className="font-rajdhani"
        >
          Back
        </Button>
        <Button 
          onClick={() => onConsentComplete(consent)}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 font-rajdhani"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete Setup
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium font-rajdhani
                  ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {step}
                </div>
                {step < 3 && <div className={`w-16 h-0.5 mx-2 
                  ${currentStep > step ? 'bg-blue-600' : 'bg-gray-700'}`} />}
              </div>
            ))}
          </div>
          <div className="text-center text-gray-400 text-sm font-rajdhani">
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Welcome' : 
              currentStep === 2 ? 'AI Features' : 
              'Privacy Controls'
            }
          </div>
        </div>

        {/* Content */}
        <div className="bg-black/40 backdrop-blur-md border border-blue-500/20 rounded-2xl p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Legal Links */}
        <div className="text-center mt-6 text-sm text-gray-400 font-rajdhani">
          By continuing, you agree to our{' '}
          <a href="/legal/terms" className="text-blue-400 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/legal/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>
          {' '}including AI data processing
        </div>
      </div>
    </div>
  );
}