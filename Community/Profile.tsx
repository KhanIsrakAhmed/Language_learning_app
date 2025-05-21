
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Lock, Upload, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    newEmail: "", // Adding new state for updated email
    full_name: "",
    avatar_url: "",
  });
  const [password, setPassword] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState(""); // Adding state for email error
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile({
            ...data,
            email: user.email || "",
            newEmail: user.email || "", // Initialize newEmail with current email
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    setPasswordError("");
    setEmailError("");
    
    // Email validation
    if (profile.newEmail !== profile.email) {
      if (!validateEmail(profile.newEmail)) {
        setEmailError("Please enter a valid email address");
        return;
      }
    }
    
    // Password validation
    if (password.newPassword || password.confirmPassword) {
      if (password.newPassword !== password.confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }
      
      if (password.newPassword.length < 6) {
        setPasswordError("Password must be at least 6 characters");
        return;
      }
    }
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const updates = {
        id: user.id,
        username: profile.username,
        full_name: profile.full_name,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(updates);

      if (profileError) throw profileError;
      
      // Update email if changed
      if (profile.newEmail !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.newEmail
        });
        
        if (emailError) throw emailError;
        
        setProfile(prev => ({ ...prev, email: profile.newEmail }));
        
        toast({
          title: "Email Update",
          description: "Verification email sent. Please check your inbox.",
        });
      }
      
      // Update password if provided
      if (password.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password.newPassword
        });
        
        if (passwordError) throw passwordError;
        
        setPassword({
          newPassword: "",
          confirmPassword: ""
        });
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileSize = file.size / 1024 / 1024; // in MB
    
    if (fileSize > 2) {
      toast({
        title: "Error",
        description: "File size should not exceed 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingAvatar(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 px-4 sm:px-6">
      <Card className="border dark:border-gray-800">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={profile.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                alt="Profile"
                className="w-24 sm:w-32 h-24 sm:h-32 rounded-full border-4 border-primary object-cover"
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <Button
                variant="secondary"
                className="absolute bottom-0 right-0"
                size="sm"
                onClick={triggerFileInput}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" /> Change
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Name
              </Label>
              <Input 
                id="name" 
                value={profile.full_name || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Your name" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Username
              </Label>
              <Input 
                id="username" 
                value={profile.username || ""} 
                onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Your username" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Current Email
              </Label>
              <Input 
                id="currentEmail" 
                type="email" 
                value={profile.email} 
                disabled 
                placeholder="your.email@example.com" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> New Email
              </Label>
              <Input 
                id="newEmail" 
                type="email" 
                value={profile.newEmail} 
                onChange={(e) => setProfile(prev => ({ ...prev, newEmail: e.target.value }))}
                placeholder="Enter new email" 
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="flex items-center gap-2">
                <Lock className="w-4 h-4" /> New Password
              </Label>
              <Input 
                id="newPassword" 
                type="password" 
                value={password.newPassword} 
                onChange={(e) => setPassword(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="w-4 h-4" /> Confirm Password
              </Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={password.confirmPassword} 
                onChange={(e) => setPassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password" 
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>

            <Button 
              className="w-full mt-6" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
