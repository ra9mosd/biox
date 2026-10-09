import { supabase } from './supabase';

          export async function uploadImage(file, userId, field) {
  try {
    const ext = file.name.split('.').pop();
              const path = `${userId}/${field}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(path, file, { upsert: true });
         if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
             .getPublicUrl(data.path);
    return publicUrl;
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    throw error;
  }
}

       export async function saveProfile(userId, profile) {
  try {
               const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: userId,
      name: profile.name,
      display_username: profile.username,
      bio: profile.bio,
      avatar_url: profile.avatar,
      banner_url: profile.banner,
      background_url: profile.background,
      accent: profile.accent,
      effect: profile.effect,
      music_url: profile.music,
      music_title: profile.musicTitle,
      updated_at: new Date(),
     });
    if (profileError) throw profileError;

      await supabase.from('links').delete().eq('user_id', userId);
    if (profile.links && profile.links.length > 0) {
      const { error: linksError } = await supabase.from('links').insert(
        profile.links.map((link, i) => ({
          user_id: userId,
          name: link.name,
          url: link.url,
          position: i,
        }))
      );
      if (linksError) throw linksError;
    }

                                                   await supabase.from('badges').delete().eq('user_id', userId);
    if (profile.badges && profile.badges.length > 0) {
      const { error: badgesError } = await supabase.from('badges').insert(
        profile.badges.map(badge => ({ user_id: userId, badge }))
      );
      if (badgesError) throw badgesError;
            }
    return true;
  } catch (error) {
    console.error('Ошибка сохранения профиля:', error);
    throw error;
  }
}

     export async function loadProfileByUsername(username) {
  try {
    const cleanUsername = username.replace('@', '').toLowerCase();
          const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, role, vip_expires')
      .eq('username', cleanUsername)
      .maybeSingle();
    if (userError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (profileError || !profile) return null;

    const { data: links } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('position');

    const { data: badges } = await supabase
      .from('badges')
      .select('badge')
      .eq('user_id', user.id);

    return {
      ...profile,
      username: profile.display_username || `@${user.username}`,
      links: links || [],
      badges: badges?.map(b => b.badge) || [],
      role: user.role,
      vipExpires: user.vip_expires,
    };
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    return null;
  }
}
      
export async function ensureUser(tgUser) {
  try {
    const username = (tgUser.username || `user${tgUser.id}`).toLowerCase();
     const { data: existing } = await supabase
      .from('users')
      .select('id, role, vip_expires, username')
      .eq('id', tgUser.id)
      .maybeSingle();

    if (existing) {
      return {
        id: existing.id,
        role: existing.role,
        vipExpires: existing.vip_expires,
        username: existing.username || username,
      };
    }

    const { data: usernameTaken } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    const finalUsername = usernameTaken
      ? `${username}${tgUser.id}`
      : username;

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: tgUser.id,
        username: finalUsername,
        first_name: tgUser.first_name,
        role: 'free',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('profiles').insert({
      user_id: tgUser.id,
      name: tgUser.first_name || '',
      display_username: `@${finalUsername}`,
    });

    return {
      id: newUser.id,
      role: newUser.role,
      vipExpires: newUser.vip_expires,
      username: finalUsername,
    };
  } catch (error) {
    console.error('Ошибка регистрации пользователя:', error);
    throw error;
  }
}
 
export async function loadMyProfile(userId) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (!profile) return null;

    const { data: links } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('position');

    const { data: badges } = await supabase
      .from('badges')
      .select('badge')
      .eq('user_id', userId);

    return {
      ...profile,
      username: profile.display_username || '',
      links: links || [],
      badges: badges?.map(b => b.badge) || [],
    };
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    return null;
  }
}