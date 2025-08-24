export interface ProfileData {
  id?: string
  personalInfo: PersonalInfo
  contactInfo: ContactInfo
  heroContent: HeroContent
  updatedAt: Date
}

export interface PersonalInfo {
  name: string
  title: string
  profileImage: string
}

export interface ContactInfo {
  github: string
  linkedin: string
  upwork: string
}

export interface HeroContent {
  description: string
  introduction: string
  hobbies: string
}

export interface ProfileFormData {
  personalInfo: PersonalInfo
  contactInfo: ContactInfo
  heroContent: HeroContent
}

export const defaultProfileData: ProfileFormData = {
  personalInfo: {
    name: 'tu_nombre',
    title: 'Full Stack Developer',
    profileImage: 'https://picsum.photos/400/400?random=profile',
  },
  contactInfo: {
    github: 'https://github.com/tu-usuario',
    linkedin: 'https://linkedin.com/in/tu-perfil',
    upwork: 'https://www.upwork.com/freelancers/tu-perfil',
  },
  heroContent: {
    description:
      'Soy un desarrollador apasionado por crear experiencias visuales impresionantes y resolver problemas complejos. Ya sea un sitio web o una aplicación móvil, me esfuerzo por entregar software que sea tanto elegante como efectivo.',
    introduction:
      '¡Hola! Mi nombre es Tu Nombre y soy un Full Stack Developer especializado en desarrollo web y móvil con más de 5 años de experiencia.',
    hobbies:
      'Además de programar, disfruto del arte, gaming, fotografía, animación y más.',
  },
}
