import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { FormAlert } from '../components/States';
import { assetUrl } from '../lib/api';
import { useAuth } from '../lib/auth';
import { getFriendlyErrorMessage } from '../lib/errors';

export function ProfilePage() {
  const { updateAvatar, updateProfile, user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isAvatarSubmitting, setIsAvatarSubmitting] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return undefined;
    }

    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [photoFile]);

  const avatarUrl = photoPreview ?? assetUrl(`/img/users/${user?.photo ?? 'default.jpg'}`);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      await updateProfile({ name, email });
      setMessage('Profile updated.');
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Could not update profile. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarMessage(null);
    setAvatarError(null);

    if (!file) {
      setPhotoFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPhotoFile(null);
      setAvatarError('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoFile(null);
      setAvatarError('Please choose an image smaller than 5 MB.');
      return;
    }

    setPhotoFile(file);
  }

  async function handleAvatarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAvatarMessage(null);
    setAvatarError(null);

    if (!photoFile) {
      setAvatarError('Please choose a photo first.');
      return;
    }

    setIsAvatarSubmitting(true);

    try {
      await updateAvatar(photoFile);
      setPhotoFile(null);
      setPhotoInputKey((value) => value + 1);
      setAvatarMessage('Profile photo updated.');
    } catch (err) {
      setAvatarError(getFriendlyErrorMessage(err, 'Could not update profile photo.'));
    } finally {
      setIsAvatarSubmitting(false);
    }
  }

  return (
    <main className="page page-narrow page-animate">
      <div className="profile-header">
        <img src={avatarUrl} alt={user?.name ?? 'User'} />
        <div>
          <p className="eyebrow">{user?.role ?? 'user'}</p>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <form className="avatar-card" onSubmit={handleAvatarSubmit}>
        <div className="avatar-preview-wrap">
          <img src={avatarUrl} alt={user?.name ?? 'User'} />
          <div>
            <p className="eyebrow">Profile photo</p>
            <h2>Change avatar</h2>
            <p>Upload a square image for the best result. The server will resize it.</p>
          </div>
        </div>

        <div className="avatar-actions">
          <label className="file-input-label">
            <span>{photoFile ? 'Choose another image' : 'Choose image'}</span>
            <input
              key={photoInputKey}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </label>

          <button className="button" type="submit" disabled={!photoFile || isAvatarSubmitting}>
            {isAvatarSubmitting ? 'Uploading...' : 'Upload avatar'}
          </button>
        </div>

        {photoFile ? <p className="file-name">{photoFile.name}</p> : null}
        {avatarMessage ? <p className="form-success">{avatarMessage}</p> : null}
        {avatarError ? <FormAlert title="Could not update avatar" message={avatarError} /> : null}
      </form>

      <form className="panel-form" onSubmit={handleSubmit}>
        <h2>Update profile</h2>

        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        {message ? <p className="form-success">{message}</p> : null}
        {error ? <FormAlert title="Could not save changes" message={error} /> : null}

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </main>
  );
}
