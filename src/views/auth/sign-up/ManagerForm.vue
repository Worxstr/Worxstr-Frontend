<template lang="pug">
.manager-form
  div
    v-subheader General info

    .d-flex.flex-column.flex-sm-row
      v-text-field.mr-sm-4(
        autofocus
        label='First name'
        placeholder='Bobby'
        v-model='form.firstName'
        :rules='rules.firstName'
        required
        outlined
        dense
      )
      v-text-field(
        label='Last name'
        placeholder='Tables'
        v-model='form.lastName'
        :rules='rules.lastName'
        required
        outlined
        dense
      )

    .d-flex.flex-column.flex-sm-row
      phone-input.mr-sm-4(
        v-model="form.phone"
        :required='true'
        outlined
        dense
      )

      v-text-field(
        label='Email'
        type='email'
        placeholder='bobby@example.com'
        required
        v-model='form.email'
        :rules='rules.email'
        outlined
        dense
      )

    .d-flex.flex-column.flex-sm-row
      v-text-field.mr-sm-4(
        label='Legal business name'
        placeholder='Worxstr'
        v-model='form.businessName'
        :rules='rules.businessName'
        required
        outlined
        dense
      )
      v-select(
        label='Business type'
        v-model='form.businessType'
        :rules='rules.businessType'
        :items='businessTypes'
        outlined
        dense
      )
  
  div(v-if='form.businessType')
    v-subheader Business information

    v-text-field.mr-sm-4(
      label='Doing business as'
      placeholder='My name'
      v-model='form.doingBusinessAs'
      required
      outlined
      dense
    )

    .d-flex.flex-column.flex-sm-row
      v-text-field.mr-sm-4(
        label='Address 1'
        placeholder='1234 Main St.'
        v-model='form.address1'
        :rules='rules.address1'
        required
        outlined
        dense
      )
      v-text-field(
        label='Address 2'
        placeholder='Apt. 123'
        v-model='form.address2'
        required
        outlined
        dense
      )

    .d-flex.flex-column.flex-sm-row
      v-text-field.mr-sm-4(
        label='City'
        placeholder='City'
        v-model='form.city'
        :rules='rules.city'
        required
        outlined
        dense
      )
      v-select.mr-sm-4(
        label='State'
        :items='states'
        v-model='form.state'
        :rules='rules.state'
        outlined
        dense
        required
      )
      v-text-field(
        label='Postal code'
        placeholder='12345'
        v-model='form.postalCode'
        :rules='rules.postalCode'
        maxlength='5'
        required
        outlined
        dense
      )
      
    .d-flex.flex-column.flex-sm-row
      v-select.mr-sm-4(
        label='Business type'
        v-model='form.businessClassification'
        :rules='rules.businessClassification'
        :items='classifications'
        outlined
        dense
      )
      v-select(
        :disabled='!form.businessClassification'
        label='Industry'
        v-model='form.industry'
        :rules='rules.industry'
        :items='getIndustries(form.businessClassification)'
        outlined
        dense
      )

    v-text-field(
      label='Employer identification number'
      placeholder='00-0000000'
      v-mask="'##-#######'"
      v-model='form.ein'
      :rules='rules.ein'
      required
      outlined
      dense
    )
    
    v-checkbox.mt-0(
      v-if='!isSoleProprieter'
      v-model='isCompanyController'
      required
    )
      template(v-slot:label)
        span.mr-2 I am also a company controller
        v-tooltip(bottom max-width='300')
          | A person significant responsibility (e.g., CEO, CFO, VP, Treasurer) for managing the business on this account.
          template(v-slot:activator='{on}')
            v-icon(v-on='on') mdi-help-circle-outline
    
  div(v-if='true')
    div(v-if='isSoleProprieter')
      v-subheader Sole proprietor verification

      .d-flex.flex-column.flex-sm-row
        v-text-field.mr-sm-4(
          label='Date of birth'
          type="date",
          v-model='form.dateOfBirth'
          :rules='rules.dateOfBirth'
          outlined
          dense
          required
        )
        v-text-field(
          label='SSN (Last 4 digits)'
          v-model='form.ssn'
          :rules='rules.ssn'
          maxlength='4'
          placeholder='1234'
          required
          outlined
          dense
        )
    
    div(v-else-if='isCompanyController')
      v-subheader User verification

      .d-flex.flex-column.flex-sm-row
        v-text-field(
          label='Title'
          placeholder='CEO'
          v-model='form.controller.title'
          :rules='rules.title'
          required
          outlined
          dense
        )
        v-text-field.mr-sm-4(
          label='Date of birth'
          type="date",
          v-model='form.controller.dateOfBirth'
          :rules='rules.dateOfBirth'
          outlined
          dense
          required
        )
      
      v-text-field(
        label='Address 1'
        placeholder='1234 Main St.'
        v-model='form.controller.address1'
        :rules='rules.address1'
        required
        outlined
        dense
      )
      .d-flex.flex-column.flex-sm-row
        v-text-field.mr-sm-4(
          label='Address 2'
          placeholder='Apt. 123'
          v-model='form.controller.address2'
          required
          outlined
          dense
        )
        v-text-field(
          label='Address 3'
          v-model='form.controller.address3'
          required
          outlined
          dense
        )

      .d-flex.flex-column.flex-sm-row
        v-text-field.mr-sm-4(
          label='City'
          placeholder='City'
          v-model='form.controller.city'
          :rules='rules.city'
          required
          outlined
          dense
        )
        v-select.mr-sm-4(
          label='Country'
          :items='countries'
          v-model='form.controller.country'
          :rules='rules.country'
          outlined
          dense
          required
        )
        
      .d-flex.flex-column.flex-sm-row
        v-select.mr-sm-4(
          label='State'
          :items='states'
          v-model='form.controller.state'
          :rules='rules.state'
          outlined
          dense
          required
        )

        v-text-field(
          label='Postal code'
          placeholder='12345'
          v-model='form.controller.postalCode'
          :rules='rules.postalCode'
          maxlength='5'
          required
          outlined
          dense
        )

      v-text-field(
        label='SSN (Last 4 digits)'
        v-model='form.ssn'
        :rules='rules.ssn'
        maxlength='4'
        placeholder='1234'
        required
        outlined
        dense
      )

    div(v-else)
      v-subheader Controller verification

      .d-flex.flex-column.flex-sm-row
        v-text-field.mr-sm-4(
          autofocus
          label='First name'
          placeholder='Bobby'
          v-model='form.controller.firstName'
          :rules='rules.firstName'
          required
          outlined
          dense
        )
        v-text-field(
          label='Last name'
          placeholder='Tables'
          v-model='form.controller.lastName'
          :rules='rules.lastName'
          required
          outlined
          dense
        )
      
      .d-flex.flex-column.flex-sm-row
        v-text-field.mr-sm-4(
          label='Date of birth'
          type="date",
          v-model='form.dateOfBirth'
          :rules='rules.dateOfBirth'
          outlined
          dense
          required
        )
        v-text-field(
          label='Title'
          placeholder='CEO'
          v-model='form.controller.title'
          :rules='rules.title'
          required
          outlined
          dense
        )

      v-text-field(
        label='Address 1'
        placeholder='1234 Main St.'
        v-model='form.controller.address1'
        :rules='rules.address1'
        required
        outlined
        dense
      )
      .d-flex.flex-column.flex-sm-row
        v-text-field.mr-sm-4(
          label='Address 2'
          placeholder='Apt. 123'
          v-model='form.controller.address2'
          required
          outlined
          dense
        )
        v-text-field(
          label='Address 3'
          v-model='form.controller.address3'
          required
          outlined
          dense
        )

      .d-flex.flex-column.flex-sm-row
        v-text-field.mr-sm-4(
          label='City'
          placeholder='City'
          v-model='form.controller.city'
          :rules='rules.city'
          required
          outlined
          dense
        )
        v-select.mr-sm-4(
          label='Country'
          :items='countries'
          v-model='form.controller.country'
          :rules='rules.country'
          outlined
          dense
          required
        )
        
      .d-flex.flex-column.flex-sm-row
        v-select.mr-sm-4(
          label='State'
          :items='states'
          v-model='form.controller.state'
          :rules='rules.state'
          outlined
          dense
          required
        )

        v-text-field(
          label='Postal code'
          placeholder='12345'
          v-model='form.controller.postalCode'
          :rules='rules.postalCode'
          maxlength='5'
          required
          outlined
          dense
        )

      v-text-field(
        label='SSN (Last 4 digits)'
        v-model='form.ssn'
        :rules='rules.ssn'
        maxlength='4'
        placeholder='1234'
        required
        outlined
        dense
      )

</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Component, Vue, Watch } from 'vue-property-decorator'
import Arrows from '@/components/Arrows.vue'
import PhoneInput from '@/components/inputs/PhoneInput.vue'
import { exists, emailRules, postalCodeRules, einRules, ssnRules } from '@/util/inputValidation'

@Component({
  components: {
    Arrows,
    PhoneInput,
  },
})
export default class ManagerForm extends Vue {
  form: any = {
    controller: {},
  }
  showPassword = false
  isCompanyController = false
  states = ['AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FM','FL','GA','GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MH','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','MP','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT','VT','VI','VA','WA','WV','WI','WY']
  countries = ["United States of America","Afghanistan","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Bouvet Island","Brazil","British Indian Ocean Territory","Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island","Cocos (Keeling) Islands","Colombia","Comoros","Congo","Congo, the Democratic Republic of the","Cook Islands","Costa Rica","Cote D'Ivoire","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands (Malvinas)","Faroe Islands","Fiji","Finland","France","French Guiana","French Polynesia","French Southern Territories","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Heard Island and Mcdonald Islands","Holy See (Vatican City State)","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran, Islamic Republic of","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","North Korea","South Korea","Kuwait","Kyrgyzstan","Lao People's Democratic Republic","Latvia","Lebanon","Lesotho","Liberia","Libyan Arab Jamahiriya","Liechtenstein","Lithuania","Luxembourg","Macao","Macedonia, the Former Yugoslav Republic of","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia, Federated States of","Moldova, Republic of","Monaco","Mongolia","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Palestinian Territory, Occupied","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russian Federation","Rwanda","Saint Helena","Saint Kitts and Nevis","Saint Lucia","Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia and the South Sandwich Islands","Spain","Sri Lanka","Sudan","Suriname","Svalbard and Jan Mayen","Swaziland","Sweden","Switzerland","Syrian Arab Republic","Taiwan","Tajikistan","Tanzania, United Republic of","Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States Minor Outlying Islands","Uruguay","Uzbekistan","Vanuatu","Venezuela","Viet Nam","Virgin Islands, British","Virgin Islands, U.S.","Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe","Åland Islands","Bonaire, Sint Eustatius and Saba","Curaçao","Guernsey","Isle of Man","Jersey","Montenegro","Saint Barthélemy","Saint Martin (French part)","Serbia","Sint Maarten (Dutch part)","South Sudan","Kosovo"]
  businessTypes = ['Sole Proprietorship', 'Corporation', 'LLC', 'Partnership']
  // TODO: Use Dwolla API to fetch these categories
  classificationsData: {
    [key: string]: string[];
  } = {
    'Food retail and service': [
      'Gourmet foods',
      'Distilleries',
      'Breweries',
      'Alcoholic beverage drinking places',
      'Beer, wine, and liquor store',
      'Wineries',
      'Tobacco',
      'Restaurant',
      'Supplement store',
      'Pharmacy and drugstore',
      'Coffee and tea',
      'Catering services',
      'Specialty and miscellaneous food store',
    ],
    Manufacturing: [
      'Nonmetallic mineral product manufacturing',
      'Furniture and related product manufacturing',
      'Plastics and rubber products manufacturing',
      'Chemical manufacturing',
      'Primary metal manufacturing',
      'Transportation equipment manufacturing',
      'Leather and allied product manufacturing',
      'Textile product mills',
      'Printing and related support activities',
      'Miscellaneous manufacturing',
      'Food manufacturing',
      'Fabricated metal product manufacturing',
      'Wood product manufacturing',
      'Computer and electronic product manufacturing',
      'Paper manufacturing',
      'Machinery manufacturing',
      'Apparel manufacturing',
      'Petroleum and coal products manufacturing',
      'Beverage and tobacco product manufacturing',
      'Electrical equipment, appliance, and component manufacturing',
      'Textile mills',
    ],
    'Business to business': [
      'Agriculture - animal production and aquaculture',
      'Agriculture - fruit, vegetable, and crop production',
      'Consulting services',
      'Agriculture - fishing, hunting, and trapping',
      'Construction - residential building',
      'Consumer goods rental',
      'Commercial and industrial goods rental',
      'Marketing',
      'Publishing',
      'Shipping and packing',
      'Stenographic and secretarial support services',
      'Multi-level marketing',
      'Office and commercial furniture',
      'Agriculture - forestry and logging',
      'Printing',
      'Mailing lists',
      'Industrial and manufacturing supplies',
      'Commercial and industrial goods repair and maintenance',
      'Quick copy and reproduction services',
      'Commercial photography, art, and graphics',
      'Architectural, engineering, and surveying services',
      'Wholesale - durable goods',
      'Consumer goods repair and maintenance',
      'Wholesale - nondurable goods',
      'Advertising and public relations',
      'Construction - specialty trade contractors',
      'Office supplies and equipment',
      'Career services',
      'Electronic repair and maintenance',
      'Wholesale - electronic markets and agents and brokers',
      'Construction - heavy and civil engineering',
      'Educational services',
      'Chemicals and allied products',
      'Accounting',
      'Construction - nonresidential building',
    ],
    'Services - other': [
      'Online dating',
      'Vision care',
      'Consumer goods rental',
      'Printing',
      'All other personal services',
      'Cleaning and maintenance',
      'Investigation and security services',
      'Computer network services',
      'Telecommunication services',
      'Entertainment',
      'Swimming pool services',
      'Warehouse clubs and supercenters',
      'Real estate agent',
      'Health and beauty spas',
      'Consulting services',
      'eCommerce services',
      'Watch, clock, and jewelry repair',
      'Real estate - other',
      'Storage',
      'Medical care',
      'Services not elsewhere classified',
      'Importing and exporting',
      'Child care services',
      'Insurance - auto and home',
      'Counseling services',
      'Graphic and commercial design',
      'Moving',
      'Event and wedding planning',
      'Electronic repair and maintenance',
      'Quick copy and reproduction services',
      'Photofinishing',
      'Radio, television, and stereo repair',
      'Publishing',
      'Lottery and contests',
      'Research and development',
      'Photographic studios - portraits',
      'Commercial photography, art, and graphics',
      'Construction - residential building',
      'Membership clubs and organizations',
      'Dental care',
      'Legal services and attorneys',
      'Mining',
      'Landscaping and horticultural',
      'Information retrieval services',
      'Insurance - life and annuity',
      'Gambling',
      'Courier services',
      'Tailors and alterations',
      'Computer and data processing services',
      'Construction - nonresidential building',
      'IDs, licenses, and passports',
      'Carpentry',
      'Local delivery service',
      'Advertising and public relations',
      'Reupholstery and furniture repair',
      'Rental property management',
      'Career services',
      'Utilities',
      'Commercial and industrial goods rental',
      'Shipping and packing',
    ],
    'Entertainment and media': [
      'Toys and games',
      'Music',
      'Gambling',
      'Cable, satellite, and other pay TV and radio broadcasting',
      'Slot machines',
      'Theater tickets',
      'Motion picture and video',
      'Digital content',
      'Entertainers',
      'Memorabilia',
      'Music store - CDs, cassettes and albums',
      'Online gaming',
      'Adult digital content',
      'Movie store - DVDs, videotapes',
      'Video games and systems',
      'Concert tickets',
      'Cable and other subscription programming',
    ],
    'Home and garden': [
      'Antiques',
      'Glass, paint, and wallpaper',
      'Appliances',
      'Exterminating and disinfecting services',
      'Drapery, window covering, and upholstery',
      'Hardware and tools',
      'Rugs and carpets',
      'Furniture',
      'Construction material',
      'Lawn and garden equipment and supplies',
      'Home furnishings store',
      'Art dealers and galleries',
    ],
    Baby: ['Safety and health', 'Furniture', "Children's and baby's clothing"],
    Travel: [
      'Tours',
      'Bus line',
      'Airline',
      'Sporting and recreation camps',
      'Cruises',
      'Lodging and accommodations',
      'Timeshares',
      'Luggage and leather goods',
      'Travel agency',
      'Taxicabs and limousines',
      'Auto rental',
      'Transportation services - other',
      'Recreational services',
      'Trailer parks and campgrounds',
    ],
    'Clothing, accessories, and shoes': [
      "Women's clothing",
      'Military and civil service uniforms',
      "Children's and baby's clothing",
      "Men's clothing",
      'Wholesale - precious stones and metals',
      'Shoes',
      'Fashion jewelry',
      'Accessories',
      'Retail - fine jewelry and watches',
    ],
    'Health and personal care': [
      'Dental care',
      'Vitamins and supplements',
      'Vision care',
      'Pharmacy and drugstore',
      'Medical care',
      'Medical equipment and supplies',
    ],
    'Beauty and fragrances': [
      'Bath and body',
      'Fragrances and perfumes',
      'Makeup and cosmetics',
    ],
    'Computers, accessories, and services': [
      'Maintenance and repair services',
      'Online gaming',
      'Software',
      'Monitors and projectors',
      'Networking',
      'Web hosting and design',
      'Training services',
      'Peripherals',
      'Desktops, laptops, and notebooks',
      'Parts and accessories',
      'eCommerce services',
      'Computer and data processing services',
    ],
    Retail: [
      'Department store',
      'Variety store',
      'Used and secondhand store',
      'Miscellaneous store retailer',
      'Discount store',
    ],
    'Toys and hobbies': [
      'Hobby, toy, and game shops',
      'Stationery, printing, and writing paper',
      'Vintage and collectibles',
      'Video games and systems',
      'Arts and crafts',
      'Memorabilia',
      'Stamp and coin',
      'Music store - instruments and sheet music',
      'Camera and photographic supplies',
    ],
    'Pets and animals': [
      'Pet shops, pet food, and supplies',
      'Veterinary services',
      'Medication and supplements',
      'Specialty and rare pets',
    ],
    Education: [
      'Vocational and trade schools',
      'Business and secretarial schools',
      'Child care services',
      'Dance halls, studios, and school',
      'Colleges and universities',
      'Elementary and secondary schools',
    ],
    'Arts, crafts, and collectibles': [
      'Stamp and coin',
      'Digital art',
      'Sewing, needlework, and fabrics',
      'Camera and photographic supplies',
      'Antiques',
      'Stationery, printing and writing paper',
      'Art dealers and galleries',
      'Memorabilia',
      'Music store - instruments and sheet music',
      'Art and craft supplies',
      'Vintage and collectibles',
    ],
    'Financial services and products': [
      'Prepaid and stored value cards',
      'Credit union',
      'Security brokers and dealers',
      'Remittance',
      'Rental property management',
      'Investment banking and securities dealing',
      'Real estate agent',
      'Sales financing',
      'Debt counseling service',
      'Collection agency',
      'Securities and commodity exchanges',
      'Financial and investment advice',
      'Accounting',
      'Escrow',
      'Mortgage brokers and dealers',
      'Financial transactions processing, reserve, and clearinghouse activities',
      'Paycheck lender and cash advance',
      'Insurance - life and annuity',
      'Other activities related to credit intermediation',
      'Online gaming currency',
      'Commodity contracts dealing',
      'Commodity contracts brokerage',
      'Other investment pools and funds',
      'Miscellaneous financial investment activities',
      'Wire transfer and money order',
      'Consumer lending',
      'Credit bureaus',
      'Insurance - auto and home',
      'Offices of other holding companies',
      'Other financial investment activities',
      'Commercial Banking',
    ],
    Government: [
      'Administration of economic programs',
      'Administration of housing programs, urban planning, and community development',
      'Administration of human resource programs',
      'Administration and environmental quality programs',
      'Justice, public order, and safety activities',
      'Executive, legislative, and other general government support',
      'Space research and technology',
      'National security and international affairs',
    ],
    'Vehicle sales': [
      'Vintage and collectibles',
      'Boat dealer',
      'Motorcycle dealer',
      'Recreational vehicle dealer',
      'Mobile home dealer',
      'Auto dealer - used only',
      'Aviation',
      'Recreational and utility trailer dealer',
      'Auto dealer - new and used',
    ],
    Nonprofit: [
      'Educational',
      'Charity',
      'Political',
      'Religious',
      'Other',
      'Personal',
    ],
    'Vehicle service and accessories': [
      'Audio and video',
      'Towing service',
      'Auto service',
      'Boat rental and leases',
      'Tools and equipment',
      'Car wash',
      'Motorhome and recreational vehicle rental',
      'Truck and utility trailer rental',
      'Parts, supplies, and accessories',
      'Auto body repair and paint',
      'Automotive tire supply and service',
      'Auto rental',
    ],
    'Electronics and telecom': [
      'General electronic accessories',
      'Cell phones, PDAs, and pagers',
      'Car audio and electronics',
      'Telecommunication equipment and sales',
      'Telephone cards',
      'Home electronics',
      'Cameras, camcorders and equipment',
      'Investigation and security services',
      'Telecommunication services',
      'Home audio',
    ],
    'Books and magazines': [
      'Rare and used books',
      'Printing',
      'Magazines',
      'Publishing',
      'Book store',
      'Audio books',
    ],
    'Religion and spirituality (for profit)': [
      'Membership services',
      'Services not elsewhere classified',
    ],
    'Sports and outdoors': [
      'Dance halls, studios, and schools',
      'Other sporting goods',
      'Firearms, knives, and martial arts weapons',
      'Swimming pools and spas',
      'Fan gear and memorabilia',
    ],
    'Gifts and flowers': [
      'Gift, card, novelty, and souvenir shops',
      'Nursery plants and flowers',
      'Party supplies',
      'Florist',
      'Gourmet foods',
    ],
  }

  rules = {
    firstName: [exists('First name required')],
    lastName: [exists('Last name required')],
    phone: [exists('Phone number required')],
    email: emailRules,
    businessName: [exists('Business name required')],
    businessType: [exists('Business type required')],
    address1: [exists('Address 1 required')],
    city: [exists('City required')],
    state: [exists('State required')],
    country: [exists('Country required')],
    postalCode: postalCodeRules,
    businessClassification: [exists('Business classification required')],
    ein: einRules,
    title: [exists('Title required')],
    ssn: ssnRules,
  }
  
  @Watch('form')
  onFormChange() {
    this.$emit('update', this.form)
  }

  get classifications() {
    return Object.keys(this.classificationsData)
  }

  getIndustries(classification: string) {
    const c = this.classificationsData[classification]
    return c || []
  }

  get isSoleProprieter() {
    return this.form.businessType === 'Sole Proprietorship'
  }
}
</script>
